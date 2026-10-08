'use client';

import { use, useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { DualCameraGrid, type DualCameraGridRef } from '@/components/photobooth/DualCameraGrid';
import { ScreenFlash } from '@/components/common/ScreenFlash';
import { CountdownOverlay } from '@/components/common/CountdownOverlay';
import { CanvasStage, type CanvasStageRef } from '@/components/photobooth/CanvasStage';
import { FramePicker } from '@/components/photobooth/FramePicker';
import { FilterBar } from '@/components/photobooth/FilterBar';
import { ExportActions } from '@/components/photobooth/ExportActions';
import { useCamera } from '@/hooks/useCamera';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSyncShutter } from '@/hooks/useSyncShutter';
import { useAuth } from '@/hooks/useAuth';
import { useRoomStore, type RoomStep, type UserRole } from '@/stores/useRoomStore';
import { usePhotoboothStore, type FrameItem } from '@/stores/usePhotoboothStore';
import { getLayouts, getRoom } from '@/lib/api';
import {
  Copy,
  Check,
  Camera,
  ArrowRight,
  RotateCcw,
  Users,
  Radio,
  Sparkles,
  CheckCircle2,
  Video,
  Timer,
  Volume2,
  VolumeX,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export interface RoomLayoutItem {
  id: string;
  name: string;
  poses: number;
  size: string;
  icon: string;
  desc: string;
  assetUrl: string;
  tag?: string;
}

const DEFAULT_ROOM_LAYOUTS: RoomLayoutItem[] = [
  {
    id: 'layout_4_grid',
    name: 'Square Polaroid Grid (4 Poses)',
    poses: 4,
    size: '10 x 10 cm Symmetrical',
    icon: 'grid_view',
    desc: 'The most balanced 2x2 grid layout. Perfect for dual portraits & fun poses.',
    assetUrl: '/frames/y2k_grid_cherry.svg',
    tag: 'MOST POPULAR',
  },
  {
    id: 'layout_3_strip',
    name: 'Classic Photostrip (3 Poses)',
    poses: 3,
    size: '5 x 15 cm Photostrip',
    icon: 'view_stream',
    desc: 'Timeless vertical strip that fits into phone cases and albums.',
    assetUrl: '/frames/y2k_strip_pink.svg',
    tag: 'ICONIC',
  },
  {
    id: 'layout_2_polaroid',
    name: 'Postcard Duo (2 Poses)',
    poses: 2,
    size: '10 x 15 cm Postcard',
    icon: 'view_agenda',
    desc: 'Wide cinematic frames with generous margins for keepsake notes.',
    assetUrl: '/frames/y2k_polaroid_butter.svg',
  },
  {
    id: 'layout_6_collage',
    name: 'Mini Collage (6 Poses)',
    poses: 6,
    size: 'Mini 6-Grid Collage',
    icon: 'dashboard',
    desc: 'Six lively candid snapshots packed into one celebratory sheet.',
    assetUrl: '/frames/y2k_collage_lavender.svg',
    tag: 'PARTY EDITION',
  },
];

export default function CollaborativeRoomPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const rawClean = roomId.replace(/^room_/i, '').toUpperCase().trim();
  const cleanCode = rawClean.startsWith('PB-') ? rawClean : `PB-${rawClean}`;

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    role,
    peerStatus,
    roomStep,
    setRoom,
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

  const [layouts, setLayouts] = useState<RoomLayoutItem[]>(DEFAULT_ROOM_LAYOUTS);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [roomAccessError, setRoomAccessError] = useState<string | null>(null);

  // Restore/detect user role if entering directly or on reload
  useEffect(() => {
    // 1. Check if role is preserved in sessionStorage for this room
    if (typeof window !== 'undefined') {
      const cachedRole =
        sessionStorage.getItem(`room_role_${roomId.toLowerCase()}`) ||
        sessionStorage.getItem(`room_role_${cleanCode}`) ||
        sessionStorage.getItem(`room_role_${roomId}`);

      if (cachedRole === 'host' || cachedRole === 'guest') {
        if (role !== cachedRole) {
          setRoom(roomId, cleanCode, cachedRole);
        }
      }
    }

    if (!isAuthenticated || !user) return;
    const currentUserId = user.id;

    async function detectRole() {
      try {
        const room = await getRoom(cleanCode);
        const targetRole: UserRole = room.host_user_id === currentUserId ? 'host' : 'guest';
        setRoom(roomId, cleanCode, targetRole);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`room_role_${roomId.toLowerCase()}`, targetRole);
          sessionStorage.setItem(`room_role_${cleanCode}`, targetRole);
        }
      } catch (err) {
        console.warn('[Room] Failed to detect role from backend:', err);
        setRoomAccessError('Room tidak ditemukan, sudah kedaluwarsa, atau telah penuh.');
      }
    }

    detectRole();
  }, [cleanCode, isAuthenticated, role, roomId, setRoom, user]);

  // Load backend layout definitions
  useEffect(() => {
    async function fetchBackendLayouts() {
      try {
        const bl = await getLayouts();
        if (bl && bl.length > 0) {
          const merged: RoomLayoutItem[] = bl.map((b) => {
            const fallback = DEFAULT_ROOM_LAYOUTS.find((d) => d.id === b.id);
            return {
              id: b.id,
              name: b.name || fallback?.name || 'Custom Layout',
              poses: b.photo_count || fallback?.poses || 4,
              size: fallback?.size || `${Math.round(b.canvas_width / 100)} x ${Math.round(b.canvas_height / 100)} cm`,
              icon: fallback?.icon || 'grid_view',
              desc: fallback?.desc || `Archival layout with ${b.photo_count} poses.`,
              assetUrl: fallback?.assetUrl || '/frames/y2k_grid_cherry.svg',
              tag: fallback?.tag,
            };
          });
          setLayouts(merged);
        }
      } catch {
        // Fallback to defaults
      }
    }

    fetchBackendLayouts();
  }, []);

  // Solo mode requires an explicit layout choice, while an online room needs a
  // deterministic starting layout so host and guest can initialize capture.
  useEffect(() => {
    if (!selectedLayoutId && layouts.length > 0) {
      selectLayout(layouts[0].id, layouts[0].poses);
    }
  }, [layouts, selectLayout, selectedLayoutId]);

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
  const localWaitingVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteWaitingVideoRef = useRef<HTMLVideoElement | null>(null);

  // Sync video streams into Waiting Room video tags
  useEffect(() => {
    if (localWaitingVideoRef.current && localStream) {
      localWaitingVideoRef.current.srcObject = localStream;
    }
  }, [localStream, roomStep]);

  useEffect(() => {
    if (remoteWaitingVideoRef.current && remoteStream) {
      remoteWaitingVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, roomStep]);

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

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(cleanCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

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

  // ==========================================================================
  // STEP 1: WAITING ROOM & FORMAT SELECTION (Matching Solo Mode Step 1)
  // ==========================================================================
  if (roomStep === 'WAITING') {
    return (
      <div className="flex flex-col min-h-screen bg-background text-on-surface">
        <Navbar />

        <main className="w-full pt-16 md:pt-20 bg-background">
          {/* Top Hero Banner */}
          <section className="relative w-full bg-secondary-container text-on-secondary-container pt-8 sm:pt-12 pb-32 sm:pb-36 md:pb-40 overflow-hidden">
            <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 text-primary border border-outline-variant/30 text-[11px] font-extrabold uppercase tracking-widest mb-3 shadow-xs font-mono">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>ONLINE DUO ROOM • {role === 'host' ? 'HOST' : 'GUEST'}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-on-secondary-container">
                WAITING ROOM &amp; FORMAT
              </h1>
              <p className="font-serif text-sm sm:text-base text-on-secondary-container/90 mt-2 max-w-xl">
                Invite your companion using your room code, confirm your live video feeds, and choose your print layout before starting.
              </p>

              {/* Stepper Pills matching Solo mode */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="bg-primary text-on-primary font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
                  1. WAITING &amp; FORMAT
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
                <span className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full opacity-80">
                  2. PHOTO SESSION
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
                <span className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full opacity-80">
                  3. EDIT BINGKAI
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
                <span className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full opacity-80">
                  4. PRINT &amp; EXPORT
                </span>
              </div>
            </div>

            {/* Scallop Wave Break to Linen Surface */}
            <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
              <svg
                className="relative block w-full h-14 sm:h-18 md:h-24 fill-background"
                preserveAspectRatio="none"
                viewBox="0 0 1440 320"
              >
                <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
              </svg>
            </div>
          </section>

          {/* Waiting Room Workspace */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 sm:py-12">
            {/* Room Code & Companion Status Banner */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant font-mono block mb-1">
                  ROOM ACCESS CODE
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary tracking-wider bg-surface-container-low px-4 py-1.5 rounded-2xl border border-outline-variant/40">
                    {cleanCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-3 rounded-2xl bg-surface-container hover:bg-primary/10 text-primary transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 max-w-md">
                  Share this code with your friend. When they enter it in the Lobby, they will instantly join this room.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-xs font-bold uppercase tracking-wider text-on-surface shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Room Link'}</span>
                </button>

                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs border ${
                    isCompanionConnected
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCompanionConnected ? 'bg-green-600 animate-ping' : 'bg-amber-600'
                    }`}
                  />
                  <span>
                    {isCompanionConnected
                      ? `Companion Connected • ${signalingMode === 'supabase' ? 'Backup' : 'Studio'} Link`
                      : 'Waiting for companion to join...'}
                  </span>
                </div>
              </div>
            </div>

            {(connectionError || peerStatus === 'error' || peerStatus === 'disconnected') && (
              <div className="max-w-4xl mx-auto mb-8 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" role="status">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider">Koneksi Duo perlu dipulihkan</p>
                    <p className="text-xs mt-0.5">{connectionError || 'Koneksi dengan companion terputus.'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={retryConnection}
                  className="px-4 py-2 rounded-xl bg-amber-900 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sambungkan Ulang
                </button>
              </div>
            )}

            {/* Dual Camera Stream Check Area */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  CAMERA CHECK
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Verify Video &amp; Lighting
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Make sure both cameras are active and well-lit before taking your snapshots.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Your Camera Feed Card */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Video className="w-4 h-4" /> Your Camera ({role === 'host' ? 'Host' : 'Guest'})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCameraReady
                        ? 'bg-green-100 text-green-800'
                        : cameraError
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isCameraReady ? 'LIVE' : cameraError ? 'BLOCKED' : 'STARTING'}
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {localStream ? (
                      <video
                        ref={localWaitingVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : cameraError ? (
                      <div className="flex flex-col items-center gap-3 text-white/70 text-xs text-center px-6">
                        <AlertTriangle className="w-8 h-8 text-amber-300" />
                        <span>{cameraError}</span>
                        <button
                          type="button"
                          onClick={retryCamera}
                          className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Coba Kamera Lagi
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/50 text-xs">
                        <Camera className="w-8 h-8 animate-pulse" />
                        <span>Initializing Camera...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Companion Camera Card */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Companion Feed ({role === 'host' ? 'Guest' : 'Host'})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompanionConnected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompanionConnected ? 'CONNECTED' : 'WAITING'}
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {remoteStream ? (
                      <video
                        ref={remoteWaitingVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-6 flex flex-col items-center justify-center text-center text-white/60">
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 animate-pulse">
                          <Radio className="w-7 h-7 text-secondary" />
                        </div>
                        <p className="font-bold text-sm text-white mb-1">
                          Waiting for companion...
                        </p>
                        <p className="text-xs text-white/60 max-w-xs">
                          Ask your friend to enter code <span className="font-mono text-secondary font-bold">{cleanCode}</span> in the Lobby.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Format Selection */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  STEP 01 / 04 • FORMAT SELECTION
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Pilih Format Cetak Bingkai
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {role === 'host'
                    ? 'Pilih layout foto favorit. Pilihan format Anda akan langsung tersinkronisasi ke teman Anda.'
                    : 'Host sedang memilih format bingkai di bawah ini.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {layouts.map((layout) => {
                  const isSelected = selectedLayoutId === layout.id;
                  return (
                    <div
                      key={layout.id}
                      onClick={() => role === 'host' && handleHostSelectLayout(layout.id, layout.poses)}
                      className={`group relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                        role === 'host' ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isSelected
                          ? 'bg-secondary-fixed text-on-secondary-fixed ring-2 ring-primary border-primary shadow-md -translate-y-1'
                          : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/40 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top badge & icon */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                            {layout.poses} POSES
                          </span>
                          {layout.tag && (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed">
                              {layout.tag}
                            </span>
                          )}
                        </div>

                        {/* Preview Illustration / SVG */}
                        <div className="relative aspect-[4/3] w-full rounded-xl bg-surface-container-low/60 overflow-hidden flex items-center justify-center p-3 mb-3 border border-outline-variant/20 group-hover:scale-[1.02] transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={layout.assetUrl}
                            alt={layout.name}
                            className="h-full object-contain drop-shadow-sm select-none pointer-events-none"
                          />
                        </div>

                        <h3 className="font-serif text-base font-bold text-primary">
                          {layout.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {layout.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-secondary font-mono">{layout.size}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shutter Timer & Sound Options (Matching Solo Mode) */}
            <div className="max-w-2xl mx-auto mb-10 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-primary">
                    Shutter Timer &amp; Suara
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    {role === 'host'
                      ? 'Atur hitung mundur otomatis untuk kedua kamera.'
                      : `Durasi timer: ${timerDuration} detik (diatur oleh Host).`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Timer Duration Pills */}
                <div className="inline-flex rounded-xl p-1 bg-surface-container-low border border-outline-variant/30">
                  {[3, 5, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={role !== 'host'}
                      onClick={() => handleHostSelectTimer(sec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        timerDuration === sec
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      } ${role === 'host' ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2.5 rounded-xl border border-outline-variant/30 transition-all cursor-pointer ${
                    soundEnabled
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                  title={soundEnabled ? 'Suara shutter aktif' : 'Suara shutter nonaktif'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Launch Action Bar */}
            <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-md text-center flex flex-col items-center gap-3">
              {role === 'host' ? (
                <>
                  <button
                    type="button"
                    disabled={!canStartSession}
                    onClick={() => navigateRoomStep('CAPTURE')}
                    className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                      canStartSession
                        ? 'bg-primary hover:bg-primary-container text-on-primary ring-2 ring-primary/40'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    <span>
                      {canStartSession
                        ? 'MULAI SESI FOTO (DUAL CAMERA)'
                        : !isCameraReady
                          ? 'MENUNGGU KAMERA ANDA'
                          : 'MENUNGGU COMPANION'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-on-surface-variant">
                    {canStartSession
                      ? 'Kamera Anda dan teman sudah siap! Klik tombol di atas untuk membuka sesi foto.'
                      : 'Sesi Duo baru dapat dimulai setelah kedua kamera dan koneksi sinkronisasi siap.'}
                  </p>
                </>
              ) : (
                <div className="py-2 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center animate-spin">
                    <Sparkles className="w-4 h-4 text-on-secondary-fixed" />
                  </div>
                  <p className="font-serif font-bold text-lg text-primary">
                    {isCompanionConnected ? 'Terhubung dengan Host!' : 'Menunggu koneksi Host…'}
                  </p>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    Menunggu host memilih format dan meluncurkan sesi pengambilan foto...
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================================================
  // STEP 2: PHOTO SESSION / CAPTURE (Matching Solo Mode Step 2)
  // ==========================================================================
  if (roomStep === 'CAPTURE') {
    return (
      <div className="flex flex-col min-h-screen bg-background text-on-surface">
        <Navbar />
        <ScreenFlash isActive={showFlash} />

        <main className="w-full pt-16 md:pt-20 bg-background">
          {/* Top Hero Banner */}
          <section className="relative w-full bg-primary text-on-primary pt-8 sm:pt-10 pb-24 sm:pb-28 overflow-hidden">
            <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-xs border border-white/20 mb-2 font-bold text-[10px] font-mono uppercase tracking-widest text-primary">
                <Camera className="w-3.5 h-3.5" />
                <span>STEP 02 / 04 • SYNCHRONIZED CAPTURE</span>
              </div>

              <h1 className="font-headline-lg text-headline-lg font-serif uppercase tracking-tight text-white">
                PHOTO SESSION ({capturedPhotos.length}/{expectedPhotoCount})
              </h1>
              <p className="text-xs sm:text-sm text-on-primary-container max-w-md mt-1">
                Strike your poses together in front of both lenses. Snaps are captured side-by-side in real-time.
              </p>

              {/* Stepper Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => role === 'host' && navigateRoomStep('WAITING')}
                  className="bg-surface-container-low/30 hover:bg-surface-container-low/50 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-colors cursor-pointer"
                >
                  1. WAITING &amp; FORMAT
                </button>
                <span className="material-symbols-outlined text-[14px] text-white/50">arrow_forward</span>
                <span className="bg-secondary-container text-on-secondary-fixed font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  2. SESI FOTO
                </span>
                <span className="material-symbols-outlined text-[14px] text-white/50">arrow_forward</span>
                <span className="bg-surface-container-low/30 text-white/70 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                  3. EDIT BINGKAI
                </span>
                <span className="material-symbols-outlined text-[14px] text-white/50">arrow_forward</span>
                <span className="bg-surface-container-low/30 text-white/70 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                  4. PRINT &amp; EXPORT
                </span>
              </div>
            </div>

            {/* Wave divider */}
            <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
              <svg className="w-full h-12 sm:h-16 block fill-background" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
              </svg>
            </div>
          </section>

          {/* Capture Workspace */}
          <section className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col items-center gap-6">
            {!isCompanionConnected && (
              <div className="w-full rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" role="alert">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider">Sesi dijeda</p>
                    <p className="text-xs mt-0.5">Shutter dinonaktifkan sampai koneksi kedua kamera pulih.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={retryConnection}
                  className="px-4 py-2 rounded-xl bg-amber-900 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sambungkan Ulang
                </button>
              </div>
            )}

            {/* Dual Camera Grid with Side-by-Side Views */}
            <DualCameraGrid
              ref={dualGridRef}
              localStream={localStream}
              remoteStream={remoteStream}
            />

            {/* Countdown Overlay */}
            <CountdownOverlay count={countdownSeconds} isActive={isCountdownActive} />

            {/* Shutter Trigger Control Bar */}
            <div className="w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-serif font-bold text-lg text-primary">
                  Synchronized Shutter (Dual View)
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {role === 'host'
                    ? `Click shutter to capture pose ${capturedPhotos.length + 1} of ${expectedPhotoCount}.`
                    : `Waiting for host to trigger the shutter. Pose ${capturedPhotos.length} of ${expectedPhotoCount} completed.`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={
                    role !== 'host' ||
                    !isCameraReady ||
                    !isCompanionConnected ||
                    isCountdownActive ||
                    hasCompleteCapture
                  }
                  onClick={triggerSynchronizedShutter}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {role !== 'host'
                      ? 'HOST CONTROLS SHUTTER'
                      : isCountdownActive
                        ? 'COUNTING…'
                        : 'SYNC SNAP!'}
                  </span>
                </button>

                {role === 'host' && hasCompleteCapture && (
                  <button
                    type="button"
                    onClick={() => navigateRoomStep('CUSTOMIZE')}
                    className="px-6 py-3.5 rounded-2xl bg-secondary-container text-on-secondary-fixed text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-secondary active:scale-95 transition-all"
                  >
                    <span>Proceed to Frames</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Captured Photos Strip Preview */}
            {capturedPhotos.length > 0 && (
              <div className="w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-3 px-1">
                  Captured Snapshots ({capturedPhotos.length}/{expectedPhotoCount})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {capturedPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xs bg-black"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`Pose ${index + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Pose {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================================================
  // STEP 3: FRAME CUSTOMIZER / STUDIO EDITOR (Matching Solo Mode Step 3)
  // ==========================================================================
  if (roomStep === 'CUSTOMIZE') {
    return (
      <div className="flex flex-col min-h-screen bg-background text-on-surface">
        <Navbar />

        <main className="w-full pt-16 md:pt-20 bg-background">
          {/* Top Hero Banner */}
          <section className="relative w-full bg-secondary-container text-on-secondary pt-8 sm:pt-10 pb-24 sm:pb-28 overflow-hidden">
            <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-xs border border-outline-variant/20 mb-2 font-bold text-[10px] font-mono uppercase tracking-widest text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>STEP 03 / 04 • FRAME EDITOR &amp; REVIEW</span>
              </div>

              <h1 className="font-headline-lg text-headline-lg font-serif uppercase tracking-tight text-on-secondary-container">
                Customize Frame &amp; Filters
              </h1>
              <p className="text-xs sm:text-sm text-on-secondary-container/90 max-w-md mt-1">
                Select your favorite frame template, apply retro vintage filters, and review your final layout.
              </p>

              {/* Stepper Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => role === 'host' && navigateRoomStep('WAITING')}
                  className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-80"
                >
                  1. WAITING &amp; FORMAT
                </button>
                <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
                <button
                  type="button"
                  onClick={() => role === 'host' && navigateRoomStep('CAPTURE')}
                  className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-80"
                >
                  2. SESI FOTO
                </button>
                <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
                <span className="bg-primary text-on-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  3. EDIT BINGKAI
                </span>
                <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
                <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-80">
                  4. PRINT &amp; EXPORT
                </span>
              </div>
            </div>

            {/* Wave divider */}
            <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
              <svg className="w-full h-12 sm:h-16 block fill-background" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
              </svg>
            </div>
          </section>

          {/* Editor Workspace */}
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Composite Canvas Stage */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <CanvasStage
                  ref={stageRef}
                  frame={selectedFrame}
                  photos={capturedPhotos}
                  filterKey={activeFilter}
                />
              </div>

                {/* Right: Frame Picker & Controls */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs">
                    <FramePicker readOnly={role !== 'host'} />
                    <div className="mt-6 pt-6 border-t border-outline-variant/30">
                      <FilterBar readOnly={role !== 'host'} />
                    </div>
                  </div>

                  {role === 'host' ? (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={!selectedFrame}
                        onClick={() => navigateRoomStep('EXPORT')}
                        className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-container text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                      >
                        <span>{selectedFrame ? 'Proceed to Print & Export' : 'Select a Frame to Continue'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateRoomStep('CAPTURE')}
                        className="w-full py-3.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-4 h-4 text-primary" />
                        <span>Retake Snapshots</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-center">
                      <p className="text-xs font-bold text-primary">Host sedang menyusun hasil akhir</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Pilihan frame dan filter akan diperbarui otomatis.</p>
                    </div>
                  )}
                </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================================================
  // STEP 4: PRINT & EXPORT (Matching Solo Mode Step 4)
  // ==========================================================================
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="w-full pt-16 md:pt-20 bg-background">
        {/* Top Hero Banner */}
        <section className="relative w-full bg-secondary-container text-on-secondary pt-8 sm:pt-10 pb-24 sm:pb-28 overflow-hidden">
          <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-xs border border-outline-variant/20 mb-2 font-bold text-[10px] font-mono uppercase tracking-widest text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP 04 / 04 • PRINT &amp; DOWNLOAD</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg font-serif uppercase tracking-tight text-on-secondary-container">
              Your Duo Keepsake is Ready
            </h1>
            <p className="text-xs sm:text-sm text-on-secondary-container/90 max-w-md mt-1">
              Download your high-resolution browser render or print it directly.
            </p>

            {/* Stepper Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-70">
                1. WAITING &amp; FORMAT
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-70">
                2. SESI FOTO
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-70">
                3. EDIT BINGKAI
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-primary text-on-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                4. PRINT &amp; EXPORT
              </span>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
            <svg className="w-full h-12 sm:h-16 block fill-background" preserveAspectRatio="none" viewBox="0 0 1440 320">
              <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        {/* Export Workspace */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Composite Canvas Stage */}
            <div className="print-output lg:col-span-7 flex flex-col items-center">
              <CanvasStage
                ref={stageRef}
                frame={selectedFrame}
                photos={capturedPhotos}
                filterKey={activeFilter}
              />
            </div>

            {/* Right: Export Actions */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <ExportActions onExportPng={handleExportPng} />

              {role === 'host' ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigateRoomStep('CUSTOMIZE')}
                    className="w-full py-3.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span>Back to Frame Editor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigateRoomStep('WAITING');
                      if (dataChannel && dataChannel.readyState === 'open') {
                        dataChannel.send(JSON.stringify({ type: 'RESET_SESSION' }));
                      }
                      resetSession();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-secondary-container text-on-secondary-fixed hover:bg-secondary text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span>Return to Waiting Room</span>
                  </button>
                </>
              ) : (
                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-center">
                  <p className="text-xs font-bold text-primary">Unduh salinan Anda kapan saja</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Host akan mengontrol perpindahan kembali ke editor atau waiting room.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
