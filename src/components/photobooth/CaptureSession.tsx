'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { playBeep, playShutter } from '@/lib/audio';
import { Footer } from '@/components/common/Footer';
import { RetakeModal } from '@/components/photobooth/RetakeModal';
import { CaptureHeaderHero } from './capture/CaptureHeaderHero';
import { CaptureViewfinder } from './capture/CaptureViewfinder';
import { CaptureReelProgress } from './capture/CaptureReelProgress';
import { CaptureTipsSection } from './capture/CaptureTipsSection';

export function CaptureSession() {
  const {
    expectedPhotoCount,
    capturedPhotos,
    pushCapturedPhoto,
    setStep,
    countdownSeconds,
    soundEnabled,
  } = usePhotoboothStore();

  const {
    videoRef,
    isReady,
    error,
    isMirrored,
    toggleMirror,
    toggleFacingMode,
    captureSnapshot,
  } = useCamera();

  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [showFlash, setShowFlash] = useState(false);
  const [retakePoseIndex, setRetakePoseIndex] = useState<number | null>(null);

  // Trigger flash effect animation
  const triggerShutterFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, 280);
  }, []);

  // Sequential capture handler
  const startSequentialCapture = useCallback(() => {
    if (isCountdown || !isReady) return;

    const poseIndex = capturedPhotos.length;
    if (poseIndex >= expectedPhotoCount) {
      setStep('CUSTOMIZE');
      return;
    }

    const runCountdownForPose = (currentPose: number) => {
      let currentSeconds = countdownSeconds || 3;
      setCountdownNum(currentSeconds);
      setIsCountdown(true);
      if (soundEnabled) playBeep(880, 0.12);

      const interval = setInterval(() => {
        currentSeconds -= 1;
        if (currentSeconds > 0) {
          setCountdownNum(currentSeconds);
          if (soundEnabled) playBeep(880, 0.12);
        } else {
          clearInterval(interval);
          setIsCountdown(false);
          if (soundEnabled) {
            playBeep(1760, 0.18);
            playShutter();
          }
          triggerShutterFlash();

          const snapshot = captureSnapshot();
          if (snapshot) {
            pushCapturedPhoto(snapshot);
          }

          const nextPose = currentPose + 1;
          if (nextPose < expectedPhotoCount) {
            setTimeout(() => {
              runCountdownForPose(nextPose);
            }, 1200);
          } else {
            setTimeout(() => {
              setStep('CUSTOMIZE');
            }, 1000);
          }
        }
      }, 1000);
    };

    runCountdownForPose(poseIndex);
  }, [
    isCountdown,
    isReady,
    capturedPhotos.length,
    expectedPhotoCount,
    countdownSeconds,
    soundEnabled,
    captureSnapshot,
    pushCapturedPhoto,
    triggerShutterFlash,
    setStep,
  ]);

  // Spacebar hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        startSequentialCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startSequentialCapture]);

  const handleReplayLastPose = () => {
    if (capturedPhotos.length > 0) {
      setRetakePoseIndex(capturedPhotos.length - 1);
    }
  };

  const progressPercent = Math.round(
    (Math.min(capturedPhotos.length, expectedPhotoCount) / expectedPhotoCount) * 100
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-on-surface">
      {/* Fullscreen Shutter Flash Overlay */}
      {showFlash && (
        <div className="fixed inset-0 bg-white pointer-events-none z-[100] transition-opacity duration-200 opacity-90" />
      )}

      {/* Top Header Zone */}
      <CaptureHeaderHero />

      {/* Main Viewfinder Stage */}
      <section className="max-w-6xl mx-auto w-full px-margin py-space-md">
        <CaptureViewfinder
          videoRef={videoRef}
          isReady={isReady}
          error={error}
          isMirrored={isMirrored}
          toggleMirror={toggleMirror}
          toggleFacingMode={toggleFacingMode}
          playShutterSound={() => playShutter()}
          isCountdown={isCountdown}
          countdownNum={countdownNum}
          capturedPhotos={capturedPhotos}
        />

        {/* Primary Shutter Action Bar */}
        <div className="sticky bottom-3 z-40 w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-space-md my-space-lg rounded-2xl border border-outline-variant/30 bg-surface/95 p-3 shadow-xl backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <button
            onClick={startSequentialCapture}
            disabled={isCountdown || !isReady}
            id="shutterButton"
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container font-headline-md text-[15px] sm:text-headline-md uppercase px-5 sm:px-8 py-4 sm:py-5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <span className="material-symbols-outlined text-[32px]">camera</span>
            <span className="tracking-wide">
              {capturedPhotos.length >= expectedPhotoCount
                ? 'ALL POSES DONE (CLICK EDIT)'
                : `SNAP PHOTO NOW (${countdownSeconds || 3} SECONDS)`}
            </span>
            <kbd className="hidden md:inline-block bg-primary text-on-primary text-[12px] font-label-sm px-2.5 py-1 rounded shadow-sm font-mono">
              SPACE
            </kbd>
          </button>

          <button
            onClick={handleReplayLastPose}
            disabled={capturedPhotos.length === 0}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 sm:py-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md uppercase border border-outline-variant/30 shadow-xs transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>Retake Pose {capturedPhotos.length || 1}</span>
          </button>
        </div>

        {/* Reel Progress Strip */}
        <CaptureReelProgress
          expectedPhotoCount={expectedPhotoCount}
          capturedPhotos={capturedPhotos}
          progressPercent={progressPercent}
          onRetake={(idx) => setRetakePoseIndex(idx)}
        />
      </section>

      {/* Pro Tips & Action Section */}
      <CaptureTipsSection
        onProceedToEditor={() => setStep('CUSTOMIZE')}
        onChangeFormat={() => setStep('SELECT_LAYOUT')}
      />

      {/* Retake Modal */}
      {retakePoseIndex !== null && (
        <RetakeModal
          poseIndex={retakePoseIndex}
          isOpen={true}
          onClose={() => setRetakePoseIndex(null)}
        />
      )}

      {/* Footer */}
      <Footer hideWave />
    </div>
  );
}
