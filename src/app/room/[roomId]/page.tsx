'use client';

import { use, useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import type { DualCameraGridRef } from '@/components/photobooth/DualCameraGrid';
import type { CanvasStageRef } from '@/components/photobooth/CanvasStage';
import { useCamera } from '@/hooks/useCamera';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSyncShutter } from '@/hooks/useSyncShutter';
import { useAuth } from '@/hooks/useAuth';
import { useRoomStore, type RoomStep } from '@/stores/useRoomStore';
import { usePhotoboothStore, type FrameItem } from '@/stores/usePhotoboothStore';
import { formatRoomCodeDisplay } from '@/lib/room-utils';
import { ArrowRight, AlertTriangle } from 'lucide-react';

import { useRoomSession } from './components/useRoomSession';
import { RoomWaitingStep } from './components/RoomWaitingStep';
import { RoomCaptureStep } from './components/RoomCaptureStep';
import { RoomCustomizeStep } from './components/RoomCustomizeStep';
import { RoomExportStep } from './components/RoomExportStep';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function CollaborativeRoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const cleanCode = formatRoomCodeDisplay(roomId);

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    role,
    peerStatus,
    roomStep,
    setRoomStep,
    remoteStream,
    dataChannel,
  } = useRoomStore();

  const {
    selectedLayoutId,
    expectedPhotoCount,
    selectLayout,
    selectedFrame,
    selectFrame,
    capturedPhotos,
    pushCapturedPhoto,
    activeFilter,
    setActiveFilter,
    resetSession,
    countdownSeconds: timerDuration,
    setCountdownSeconds: setTimerDuration,
    soundEnabled,
    setSoundEnabled,
  } = usePhotoboothStore();

  const [showFlash, setShowFlash] = useState(false);

  // Hook extracting role detection & layout loading
  const { layouts, roomAccessError } = useRoomSession({
    roomId,
    cleanCode,
    user,
    isAuthenticated,
  });

  const {
    stream: localStream,
    isReady: isCameraReady,
    error: cameraError,
    retryCamera,
  } = useCamera();

  const {
    retryConnection,
    signalingMode,
    connectionError,
  } = useWebRTC(roomId, role, localStream);

  const isDataChannelReady = dataChannel?.readyState === 'open';
  const isCompanionConnected =
    peerStatus === 'connected' && Boolean(remoteStream) && isDataChannelReady;
  const hasCompleteCapture =
    expectedPhotoCount > 0 && capturedPhotos.length >= expectedPhotoCount;
  const canStartSession =
    role === 'host' && isCameraReady && isCompanionConnected && Boolean(selectedLayoutId);

  const stageRef = useRef<CanvasStageRef | null>(null);
  const dualGridRef = useRef<DualCameraGridRef | null>(null);

  // Synchronized Snapshot Capture
  const handleSynchronizedCapture = useCallback(() => {
    if (capturedPhotos.length >= expectedPhotoCount || !remoteStream) return;

    if (dualGridRef.current) {
      const dualSnap = dualGridRef.current.captureDualSnapshot();
      if (dualSnap) {
        pushCapturedPhoto(dualSnap);
      }
    }
  }, [capturedPhotos.length, expectedPhotoCount, pushCapturedPhoto, remoteStream]);

  const { isCountdownActive, countdownSeconds, triggerSynchronizedShutter } = useSyncShutter({
    onCapture: handleSynchronizedCapture,
    duration: timerDuration,
    soundEnabled,
    canTrigger: role === 'host' && isCameraReady && isCompanionConnected && !hasCompleteCapture,
    onFlash: () => {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 450);
    },
  });

  // Navigate room step synchronized across DataChannel
  const navigateRoomStep = useCallback(
    (nextStep: RoomStep) => {
      if (role !== 'host') return;
      if (nextStep === 'CAPTURE' && !canStartSession) return;
      if ((nextStep === 'CUSTOMIZE' || nextStep === 'EXPORT') && !hasCompleteCapture) return;
      if (nextStep === 'EXPORT' && !selectedFrame) return;

      setRoomStep(nextStep);
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(
          JSON.stringify({
            type: 'SET_ROOM_STEP',
            step: nextStep,
          })
        );
      }
    },
    [canStartSession, dataChannel, hasCompleteCapture, role, selectedFrame, setRoomStep]
  );

  // Host broadcasts layout selection to Guest
  const handleHostSelectLayout = (layoutId: string, poses: number) => {
    selectLayout(layoutId, poses);
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(
        JSON.stringify({
          type: 'SELECT_LAYOUT',
          layoutId,
          poses,
        })
      );
    }
  };

  // Host broadcasts timer selection to Guest
  const handleHostSelectTimer = (sec: number) => {
    setTimerDuration(sec);
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(
        JSON.stringify({
          type: 'SET_TIMER',
          duration: sec,
        })
      );
    }
  };

  // Listen for peer channel messages (Layout Sync, Timer Sync, Step Sync)
  useEffect(() => {
    if (!dataChannel) return;

    const handleDataMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as {
          type?: string;
          step?: RoomStep;
          layoutId?: string;
          poses?: number;
          duration?: number;
          frame?: FrameItem | null;
          filter?: string;
        };
        if (role !== 'guest') return;

        if (message.type === 'RESET_SESSION') {
          resetSession();
          setRoomStep('WAITING');
        } else if (message.type === 'SET_ROOM_STEP') {
          if (message.step) setRoomStep(message.step);
        } else if (message.type === 'SELECT_LAYOUT' && message.layoutId && message.poses) {
          if (message.layoutId !== selectedLayoutId || message.poses !== expectedPhotoCount) {
            selectLayout(message.layoutId, message.poses);
          }
        } else if (message.type === 'SET_TIMER' && message.duration) {
          setTimerDuration(message.duration);
        } else if (message.type === 'SELECT_FRAME') {
          selectFrame(message.frame ?? null);
        } else if (message.type === 'SET_FILTER' && message.filter) {
          setActiveFilter(message.filter);
        }
      } catch (e) {
        console.error('Error handling data channel message:', e);
      }
    };

    dataChannel.addEventListener('message', handleDataMessage);
    return () => dataChannel.removeEventListener('message', handleDataMessage);
  }, [
    dataChannel,
    expectedPhotoCount,
    resetSession,
    role,
    selectFrame,
    selectLayout,
    selectedLayoutId,
    setActiveFilter,
    setRoomStep,
    setTimerDuration,
  ]);

  // Sync state to newly connected peer when channel opens
  useEffect(() => {
    if (!dataChannel || role !== 'host') return;

    const handleOpen = () => {
      if (selectedLayoutId) {
        dataChannel.send(
          JSON.stringify({
            type: 'SELECT_LAYOUT',
            layoutId: selectedLayoutId,
            poses: expectedPhotoCount,
          })
        );
      }
      dataChannel.send(
        JSON.stringify({
          type: 'SET_TIMER',
          duration: timerDuration,
        })
      );
      dataChannel.send(
        JSON.stringify({
          type: 'SET_ROOM_STEP',
          step: roomStep,
        })
      );
      dataChannel.send(
        JSON.stringify({
          type: 'SELECT_FRAME',
          frame: selectedFrame,
        })
      );
      dataChannel.send(
        JSON.stringify({
          type: 'SET_FILTER',
          filter: activeFilter,
        })
      );
    };

    if (dataChannel.readyState === 'open') {
      handleOpen();
    } else {
      dataChannel.addEventListener('open', handleOpen);
      return () => dataChannel.removeEventListener('open', handleOpen);
    }
  }, [
    activeFilter,
    dataChannel,
    expectedPhotoCount,
    role,
    roomStep,
    selectedFrame,
    selectedLayoutId,
    timerDuration,
  ]);

  const handleExportPng = () => {
    if (stageRef.current) {
      return stageRef.current.exportHighResPng();
    }
    return null;
  };

  // Unauthenticated screen
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-36 pb-16 flex items-center justify-center">
          <div className="w-full bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 text-center shadow-lg">
            <h1 className="font-serif text-2xl font-bold text-primary mb-2">
              Sign In Required
            </h1>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Online Collaborative Photobooth with Dual Camera feeds is only accessible to authenticated studio members.
              Please sign in to join room <code className="bg-surface-container px-2 py-0.5 rounded font-mono font-bold">{cleanCode}</code>.
            </p>
            <Link
              href={`/login?redirect=/room/${roomId}`}
              className="w-full py-3.5 rounded-2xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (roomAccessError) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-36 pb-16 flex items-center justify-center">
          <div className="w-full bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 text-center shadow-lg">
            <AlertTriangle className="w-9 h-9 mx-auto mb-4 text-amber-600" />
            <h1 className="font-serif text-2xl font-bold text-primary mb-2">Room Tidak Tersedia</h1>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">{roomAccessError}</p>
            <Link
              href="/room/lobby"
              className="w-full py-3.5 rounded-2xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              Kembali ke Lobby
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // STEP 1: WAITING ROOM & FORMAT SELECTION
  if (roomStep === 'WAITING') {
    return (
      <RoomWaitingStep
        cleanCode={cleanCode}
        role={role}
        signalingMode={signalingMode}
        peerStatus={peerStatus}
        connectionError={connectionError}
        retryConnection={retryConnection}
        isCameraReady={isCameraReady}
        cameraError={cameraError}
        retryCamera={retryCamera}
        localStream={localStream}
        remoteStream={remoteStream}
        isCompanionConnected={isCompanionConnected}
        layouts={layouts}
        selectedLayoutId={selectedLayoutId}
        onSelectLayout={handleHostSelectLayout}
        timerDuration={timerDuration}
        onSelectTimer={handleHostSelectTimer}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        canStartSession={canStartSession}
        onStartSession={() => navigateRoomStep('CAPTURE')}
      />
    );
  }

  // STEP 2: PHOTO SESSION / CAPTURE
  if (roomStep === 'CAPTURE') {
    return (
      <RoomCaptureStep
        role={role}
        capturedPhotos={capturedPhotos}
        expectedPhotoCount={expectedPhotoCount}
        isCompanionConnected={isCompanionConnected}
        connectionError={connectionError}
        retryConnection={retryConnection}
        dualGridRef={dualGridRef}
        localStream={localStream}
        remoteStream={remoteStream}
        countdownSeconds={countdownSeconds}
        isCountdownActive={isCountdownActive}
        isCameraReady={isCameraReady}
        hasCompleteCapture={hasCompleteCapture}
        showFlash={showFlash}
        triggerSynchronizedShutter={triggerSynchronizedShutter}
        onBackToWaiting={() => navigateRoomStep('WAITING')}
        onProceedToCustomize={() => navigateRoomStep('CUSTOMIZE')}
      />
    );
  }

  // STEP 3: FRAME CUSTOMIZER / STUDIO EDITOR
  if (roomStep === 'CUSTOMIZE') {
    return (
      <RoomCustomizeStep
        role={role}
        stageRef={stageRef}
        selectedFrame={selectedFrame}
        capturedPhotos={capturedPhotos}
        activeFilter={activeFilter}
        onBackToWaiting={() => navigateRoomStep('WAITING')}
        onBackToCapture={() => navigateRoomStep('CAPTURE')}
        onProceedToExport={() => navigateRoomStep('EXPORT')}
      />
    );
  }

  // STEP 4: PRINT & EXPORT
  return (
    <RoomExportStep
      role={role}
      stageRef={stageRef}
      selectedFrame={selectedFrame}
      capturedPhotos={capturedPhotos}
      activeFilter={activeFilter}
      onExportPng={handleExportPng}
      onBackToCustomize={() => navigateRoomStep('CUSTOMIZE')}
      onReturnToWaiting={() => {
        navigateRoomStep('WAITING');
        if (dataChannel && dataChannel.readyState === 'open') {
          dataChannel.send(JSON.stringify({ type: 'RESET_SESSION' }));
        }
        resetSession();
      }}
    />
  );
}
