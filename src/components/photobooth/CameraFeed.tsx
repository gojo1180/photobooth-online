'use client';

import { useState, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { CountdownOverlay } from '@/components/common/CountdownOverlay';
import { ScreenFlash } from '@/components/common/ScreenFlash';
import { playBeep, playShutter } from '@/lib/audio';
import { Camera, FlipHorizontal, RefreshCw, BatteryMedium } from 'lucide-react';

export function CameraFeed() {
  const {
    expectedPhotoCount,
    capturedPhotos,
    pushCapturedPhoto,
    setStep,
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

  // Sequential capture handler
  const startSequentialCapture = useCallback(() => {
    if (isCountdown || !isReady) return;

    const poseIndex = capturedPhotos.length;
    if (poseIndex >= expectedPhotoCount) return;

    const runCountdownForPose = (currentPose: number) => {
      let currentSeconds = 3;
      setCountdownNum(currentSeconds);
      setIsCountdown(true);
      playBeep(880, 0.12);

      const interval = setInterval(() => {
        currentSeconds -= 1;
        if (currentSeconds > 0) {
          setCountdownNum(currentSeconds);
          playBeep(880, 0.12);
        } else {
          clearInterval(interval);
          setIsCountdown(false);
          playBeep(1760, 0.18);
          playShutter();

          // Flash feedback
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 450);

          // Capture frame
          const snapshot = captureSnapshot();
          if (snapshot) {
            pushCapturedPhoto(snapshot);
          }

          const nextPose = currentPose + 1;
          if (nextPose < expectedPhotoCount) {
            // Pause 1.2 seconds between poses, then run countdown for next pose
            setTimeout(() => {
              runCountdownForPose(nextPose);
            }, 1200);
          } else {
            // Done capturing all poses -> proceed to CUSTOMIZE
            setTimeout(() => {
              setStep('CUSTOMIZE');
            }, 800);
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
    captureSnapshot,
    pushCapturedPhoto,
    setStep,
  ]);

  return (
    <div className="w-full max-w-[840px] mx-auto py-6 px-4">
      <ScreenFlash isActive={showFlash} />

      {/* Studio Viewfinder Frame */}
      <div className="relative bg-[#0f1423] rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl">
        {/* Top Studio Display Header */}
        <div className="flex items-center justify-between text-white/90 px-3 pb-3 text-xs font-mono font-bold tracking-widest border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE STUDIO VIEWFINDER</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-secondary-container font-semibold">
              POSE {Math.min(capturedPhotos.length + 1, expectedPhotoCount)}/{expectedPhotoCount}
            </span>
            <div className="flex items-center gap-1 text-white/70">
              <BatteryMedium className="w-4 h-4" />
              <span>98%</span>
            </div>
          </div>
        </div>

        {/* Video Screen Container */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-black rounded-2xl overflow-hidden border border-white/15">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-200 ${isMirrored ? 'scale-x-[-1]' : ''
              }`}
          />

          {/* Viewfinder Crosshair & Corner Marks */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white/40" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-white/40" />
            </div>
            <div className="self-center w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-secondary-container rounded-full" />
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-2 border-l-2 border-white/40" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-white/40" />
            </div>
          </div>

          {/* Countdown Overlay */}
          <CountdownOverlay
            count={countdownNum}
            isActive={isCountdown}
            poseIndex={capturedPhotos.length}
            totalPoses={expectedPhotoCount}
          />

          {/* Error Banner */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-6 text-center">
              <div>
                <p className="font-bold text-red-400 mb-2">Camera Access Failed</p>
                <p className="text-xs text-white/70">{error}</p>
                <p className="text-xs text-secondary-container mt-2">
                  Please ensure camera permissions are enabled in your browser.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Camera Control Deck */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMirror}
              title="Flip Mirror"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer active:scale-95"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleFacingMode}
              title="Switch Camera"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Big Tactile Shutter Button */}
          <button
            type="button"
            disabled={isCountdown || !isReady || capturedPhotos.length >= expectedPhotoCount}
            onClick={startSequentialCapture}
            className="px-8 py-3.5 rounded-full bg-secondary-container hover:bg-secondary-container/90 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/40 disabled:border-white/10 text-on-secondary-container font-extrabold uppercase text-xs md:text-sm tracking-wider shadow-md transition-all flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            <span>
              {isCountdown
                ? 'Capturing...'
                : capturedPhotos.length >= expectedPhotoCount
                  ? 'All Poses Done'
                  : `Snap Pose (${capturedPhotos.length}/${expectedPhotoCount})`}
            </span>
          </button>

          {/* Film Thumbnails Preview */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: expectedPhotoCount }).map((_, i) => {
              const photo = capturedPhotos[i];
              return (
                <div
                  key={i}
                  className="w-9 h-11 rounded-lg border border-white/20 bg-black/60 overflow-hidden flex items-center justify-center text-[10px] text-white/50"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={`Pose ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
