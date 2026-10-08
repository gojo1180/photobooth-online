'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { playBeep, playShutter } from '@/lib/audio';
import { Footer } from '@/components/common/Footer';
import { RetakeModal } from '@/components/photobooth/RetakeModal';

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

          // Capture snapshot from webcam
          const snapshot = captureSnapshot();
          if (snapshot) {
            pushCapturedPhoto(snapshot);
          }

          const nextPose = currentPose + 1;
          if (nextPose < expectedPhotoCount) {
            // Pause 1.2 seconds between poses, then run next countdown
            setTimeout(() => {
              runCountdownForPose(nextPose);
            }, 1200);
          } else {
            // Done capturing all poses -> transition to CUSTOMIZE step
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

  // Repeat/retake last pose
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

      {/* TOP MUSTARD GOLD HERO / HEADER ZONE (Scribblepie Style) */}
      <section className="w-full bg-secondary-container text-on-secondary-fixed pt-10 pb-16 px-margin relative overflow-hidden">
        {/* Subtle graphic background ornament: radiating vintage rings */}
        <div
          className="absolute -left-12 -top-12 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, #001c97 20%, transparent 22%, transparent 35%, #001c97 37%, transparent 39%, transparent 55%, #001c97 57%)',
          }}
        />
        <div className="absolute right-8 top-10 opacity-15 pointer-events-none hidden md:block">
          <svg
            className="fill-primary animate-spin"
            height="110"
            style={{ animationDuration: '25s' }}
            viewBox="0 0 100 100"
            width="110"
          >
            <polygon points="50,0 54,38 90,20 62,48 100,50 62,54 90,80 54,62 50,100 46,62 10,80 38,54 0,50 38,48 10,20 46,38" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Status pill badges */}
          <div className="flex flex-wrap items-center justify-center gap-space-xs mb-space-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-label-sm text-label-sm uppercase font-bold">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              STUDIO BOOTH #PB-204
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary shadow-xs font-label-sm text-label-sm uppercase font-bold">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              HD CAMERA ARMED &amp; READY
            </span>
          </div>

          {/* Main Playful Title */}
          <h1 className="font-headline-lg text-headline-lg md:text-display-lg text-primary tracking-tight uppercase max-w-3xl mb-space-xs font-serif">
            SMILE FOR THE CAMERA!
          </h1>
          <p className="font-body-lg text-body-lg text-on-secondary-fixed max-w-xl italic">
            Pose freely, laugh out loud, and let the photobooth capture your best memories.
          </p>
        </div>
      </section>

      {/* WAVE DIVIDER: Gold to Cream Surface */}
      <div className="w-full text-secondary-container bg-background leading-none overflow-hidden select-none -mt-[1px]">
        <svg className="w-full h-16 sm:h-20 md:h-28 block fill-current" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,0L0,0Z" />
        </svg>
      </div>

      {/* MAIN CAPTURE SUITE / VIEWFINDER STAGE */}
      <section className="max-w-6xl mx-auto w-full px-margin py-space-md">
        {/* Arched Emblem Title Badge */}
        <div className="flex flex-col items-center justify-center -mt-8 mb-space-md relative z-20">
          <div className="relative w-44 h-24 flex items-center justify-center">
            {/* Arched Text SVG */}
            <svg className="w-44 h-24 overflow-visible" viewBox="0 0 200 100">
              <path d="M 15 85 A 85 85 0 0 1 185 85" fill="transparent" id="curve" />
              <text className="font-label-md text-[13px] uppercase fill-secondary font-bold tracking-[0.24em]">
                <textPath href="#curve" startOffset="50%" textAnchor="middle">
                  Studio Lens #02
                </textPath>
              </text>
            </svg>
            {/* Center Emblem */}
            <div className="absolute top-9 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shadow-xs border border-primary/20">
              <span className="material-symbols-outlined text-[20px]">lens_blur</span>
            </div>
          </div>
        </div>

        {/* DUAL VIEWFINDER TILES (High Graphic Frame) */}
        <div className="relative p-space-sm sm:p-space-md bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm relative">
            {/* Feed 1: Main Active Webcam */}
            <div className="relative group rounded-lg overflow-hidden bg-black aspect-[3/4] flex flex-col justify-between p-space-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
              {/* Webcam Video Tag */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Scrim & Corner Grid Marks */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/60 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/60 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/60 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/60 pointer-events-none" />

              {/* Feed Top Overlay */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-xs font-bold">
                  <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-amber-300 animate-pulse'}`} />
                  {isReady ? 'MAIN CAMERA (LIVE)' : 'CONNECTING CAMERA'}
                </span>
                <span className="w-7 h-7 rounded-full bg-surface/80 backdrop-blur-sm text-primary flex items-center justify-center shadow">
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                </span>
              </div>

              {/* Feed Bottom Overlay Info */}
              <div className="relative z-10 flex items-center justify-between text-on-primary font-label-sm text-label-sm">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-secondary-fixed text-[16px]">hd</span>
                  <span>1080p Studio Sensor</span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono text-[11px]">
                  {isReady ? 'READY' : 'CONNECTING...'}
                </div>
              </div>

              {/* Error Warning if webcam is unavailable */}
              {error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 text-white p-4 text-center">
                  <div>
                    <p className="font-bold text-red-400 mb-1">Camera Access Required</p>
                    <p className="text-xs text-white/80">{error}</p>
                    <p className="text-[11px] text-secondary-fixed mt-2">
                      Please allow camera permissions in your browser to start shooting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Feed 2: Latest Captured Preview or Standby Graphic */}
            <div className="relative group rounded-lg overflow-hidden bg-surface-dim aspect-[3/4] hidden md:flex flex-col justify-between p-space-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.12)]">
              {/* If a previous photo has been taken, show it! Else show stylish standby illustration */}
              {capturedPhotos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src={capturedPhotos[capturedPhotos.length - 1]}
                  alt={`Latest Shot: Pose ${capturedPhotos.length}`}
                />
              ) : (
                /* High-end vector camera viewfinder standby graphic */
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#0f1423] via-[#1a2139] to-primary flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 shadow-lg">
                    <span className="material-symbols-outlined text-[32px] text-secondary-container">photo_camera</span>
                  </div>
                  <span className="font-headline-md text-white font-bold text-sm tracking-wider uppercase">
                    Ready for Pose #1
                  </span>
                  <span className="text-[11px] text-white/70 mt-1 max-w-[180px]">
                    Live viewfinder standby. Press spacebar or click shutter to capture.
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Feed Top Overlay */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm shadow-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">favorite</span>
                  {capturedPhotos.length > 0 ? `POSE #${capturedPhotos.length}` : 'STUDIO STANDBY'}
                </span>
                <span className="w-7 h-7 rounded-full bg-surface/80 backdrop-blur-sm text-primary flex items-center justify-center shadow">
                  <span className="material-symbols-outlined text-[16px]">wifi</span>
                </span>
              </div>

              {/* Feed Bottom Audio & Exposure Status */}
              <div className="relative z-10 flex items-center justify-between text-on-primary font-label-sm text-label-sm">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[16px]">auto_fix_high</span>
                  <span>Retro Digicam Filter</span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full font-mono text-[11px]">
                  {capturedPhotos.length > 0 ? 'Saved to Strip' : 'Sensor Ready'}
                </div>
              </div>
            </div>

            {/* CENTER COUNTDOWN BADGE (Floating over center gap) */}
            {isCountdown && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-200">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface-container-lowest text-primary shadow-2xl border border-outline-variant/30 flex flex-col items-center justify-center">
                  <span className="font-headline-lg text-[44px] md:text-[56px] leading-none font-bold">
                    {countdownNum}
                  </span>
                  <span className="font-label-sm text-label-sm tracking-widest uppercase font-bold text-secondary">
                    READY POSE!
                  </span>
                </div>
                {/* Tiny Sparkle Sticker */}
                <div className="mt-2 bg-secondary text-on-secondary font-label-sm text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow font-bold">
                  Hold That Smile
                </div>
              </div>
            )}
          </div>

          {/* Quick Control Ribbon under Viewfinder */}
          <div className="mt-space-sm pt-space-xs flex flex-wrap items-center justify-between gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs">
              <button
                onClick={toggleMirror}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-outline-variant/30 shadow-xs transition-transform active:scale-[0.98] cursor-pointer font-bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">flip_camera_ios</span>
                <span>{isMirrored ? 'Mirror (On)' : 'Mirror (Off)'}</span>
              </button>
              <button
                onClick={toggleFacingMode}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-outline-variant/30 shadow-xs transition-transform active:scale-[0.98] cursor-pointer font-bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Switch Lens</span>
              </button>
              <button
                onClick={() => playShutter()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase border border-outline-variant/30 shadow-xs transition-transform active:scale-[0.98] cursor-pointer font-bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>Test Shutter Sound</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                Quality: High-Resolution Browser Capture
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY SHUTTER ACTION BAR (High Graphic Contrast) */}
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

        {/* PROGRESS STRIP CARD CAROUSEL (Scribblepie 4-Slot Strip Flow) */}
        <div className="w-full bg-surface-container-lowest p-space-md rounded-xl shadow-sm my-space-md border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary uppercase font-serif">
                PHOTOSTRIP REEL PROGRESS
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Complete all {expectedPhotoCount} candid poses to generate your physical print layout.
              </p>
            </div>
            <div className="flex items-center gap-1 font-label-sm text-label-sm px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full self-start font-bold">
              <span className="material-symbols-outlined text-[16px]">photo_library</span>
              <span>Progress: {progressPercent}% Done</span>
            </div>
          </div>

          {/* Strip Slots Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
            {Array.from({ length: expectedPhotoCount }).map((_, i) => {
              const photo = capturedPhotos[i];
              const isCurrentActive = i === capturedPhotos.length;
              const isNextInQueue = i === capturedPhotos.length + 1;

              if (photo) {
                // Slot: Saved Photo
                return (
                  <div
                    key={i}
                    className="bg-surface-container-lowest p-space-xs rounded-lg shadow-xs flex flex-col border border-outline-variant/30"
                  >
                    <div className="relative aspect-[3/4] rounded overflow-hidden bg-surface-dim mb-space-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="w-full h-full object-cover"
                        src={photo}
                        alt={`Pose #${i + 1}`}
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold">
                        Pose #0{i + 1}
                      </div>
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shadow">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                    </div>
                    <div className="p-1 flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-primary uppercase font-bold">
                        SAVED
                      </span>
                      <button
                        onClick={() => setRetakePoseIndex(i)}
                        className="font-label-sm text-label-sm text-secondary hover:underline inline-flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        <span>Retake</span>
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                      </button>
                    </div>
                  </div>
                );
              }

              if (isCurrentActive) {
                // Slot: Active Pose in progress
                return (
                  <div
                    key={i}
                    className="bg-tertiary-fixed/30 p-space-xs rounded-lg shadow-[3px_3px_0px_#541b44] flex flex-col relative border border-tertiary-fixed"
                  >
                    <div className="relative aspect-[3/4] rounded overflow-hidden bg-tertiary-container text-on-tertiary flex flex-col items-center justify-center p-space-sm text-center mb-space-xs">
                      <div
                        className="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mb-2 animate-spin"
                        style={{ animationDuration: '3s' }}
                      >
                        <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
                      </div>
                      <span className="font-headline-md text-label-md uppercase text-on-tertiary font-bold">
                        Ready for Pose...
                      </span>
                      <p className="font-body-sm text-[11px] text-tertiary-fixed mt-1">
                        Look at the lens now!
                      </p>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-tertiary text-on-tertiary font-label-sm text-label-sm uppercase font-bold">
                        Pose #0{i + 1} (ACTIVE)
                      </div>
                    </div>
                    <div className="p-1 flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-tertiary uppercase font-bold">
                        TARGETING LENS
                      </span>
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                    </div>
                  </div>
                );
              }

              if (isNextInQueue) {
                // Slot: Next in queue
                return (
                  <div
                    key={i}
                    className="bg-surface-container-low p-space-xs rounded-lg shadow-[2px_2px_0px_#c5c5d7] flex flex-col opacity-80 border border-surface-container"
                  >
                    <div className="relative aspect-[3/4] rounded overflow-hidden bg-surface-container flex flex-col items-center justify-center p-space-sm text-center mb-space-xs">
                      <span className="material-symbols-outlined text-outline text-[32px] mb-1">
                        add_a_photo
                      </span>
                      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-bold">
                        Pose #0{i + 1}
                      </span>
                      <span className="font-body-sm text-[11px] text-outline mt-0.5">
                        Next in line
                      </span>
                    </div>
                    <div className="p-1 text-center">
                      <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-bold">
                        UPCOMING POSE
                      </span>
                    </div>
                  </div>
                );
              }

              // Slot: Locked / Later in queue
              return (
                <div
                  key={i}
                  className="bg-surface-container-low p-space-xs rounded-lg shadow-[2px_2px_0px_#c5c5d7] flex flex-col opacity-60 border border-surface-container"
                >
                  <div className="relative aspect-[3/4] rounded overflow-hidden bg-surface-container flex flex-col items-center justify-center p-space-sm text-center mb-space-xs">
                    <span className="material-symbols-outlined text-outline text-[32px] mb-1">
                      lock
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-bold">
                      Pose #0{i + 1}
                    </span>
                    <span className="font-body-sm text-[11px] text-outline mt-0.5">
                      Pending Slot
                    </span>
                  </div>
                  <div className="p-1 text-center">
                    <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-bold">
                      IN QUEUE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WAVE DIVIDER: Cream Surface to Cobalt Blue Quote Panel */}
      <div className="w-full text-primary bg-background leading-none overflow-hidden select-none -mb-[1px]">
        <svg className="w-full h-16 sm:h-20 md:h-28 block fill-current" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
        </svg>
      </div>

      {/* COBALT BLUE INTERACTIVE TIPS PANEL */}
      <section className="w-full bg-primary text-on-primary py-space-xl px-margin relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Pill Badge */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md uppercase shadow-xs mb-space-sm font-bold border border-white/20">
            <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
            PRO TIPS FOR NATURAL POSES
          </span>

          {/* Headline */}
          <h3 className="font-headline-lg text-headline-lg text-on-primary mb-space-sm tracking-tight font-serif">
            &ldquo;The most memorable photos happen when you let go and laugh spontaneously.&rdquo;
          </h3>
          <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl mb-space-lg italic">
            Try looking at each other, giving joyful high-fives, or striking goofy faces before the countdown hits zero!
          </p>

          {/* Micro Action Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md w-full max-w-2xl text-left">
            <div className="bg-surface-container-lowest text-on-surface p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[12px]">
                    1
                  </span>
                  <h4 className="font-headline-md text-label-md uppercase text-primary font-bold">
                    Position Your Light
                  </h4>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Keep your light source in front of your screen so your smiles look clear, radiant, and well-lit.
                </p>
              </div>
              <div className="mt-4 pt-2 flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span>Bright Ambient Exposure</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest text-on-surface p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[12px]">
                    2
                  </span>
                  <h4 className="font-headline-md text-label-md uppercase text-primary font-bold">
                    Quick Spacebar Shortcut
                  </h4>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  No need to reach for the mouse! Press the{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px] font-bold">
                    SPACE
                  </kbd>{' '}
                  key on your keyboard to instantly trigger the shutter countdown.
                </p>
              </div>
              <div className="mt-4 pt-2 flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">keyboard</span>
                <span>Hands-Free Trigger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WAVE DIVIDER: Cobalt Blue to Sweet Pink Section */}
      <div className="w-full text-primary bg-tertiary-fixed leading-none overflow-hidden select-none -mt-[1px]">
        <svg className="w-full h-16 sm:h-20 md:h-28 block fill-current" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,0L0,0Z" />
        </svg>
      </div>

      {/* SWEET PINK BOTTOM CTA SECTION */}
      <section className="w-full bg-tertiary-fixed text-on-tertiary-fixed py-space-xl px-margin relative">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-tertiary mb-2 font-bold">
            NEXT STEP • FRAME &amp; CUSTOMIZE
          </span>
          <h2 className="font-headline-lg text-headline-lg md:text-display-lg text-tertiary tracking-tight mb-space-sm font-serif">
            All Poses Captured?
          </h2>
          <p className="font-body-lg text-body-lg text-on-tertiary-fixed-variant mb-space-lg max-w-xl">
            Head over to the studio editor to pick your signature keepsake frame, apply vintage color grades, and export your print.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full sm:w-auto">
            <button
              onClick={() => setStep('CUSTOMIZE')}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-headline-md text-label-md uppercase px-8 py-4 rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer font-bold"
            >
              <span>PROCEED TO FRAME EDITOR</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={() => setStep('SELECT_LAYOUT')}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface text-on-surface font-label-md text-label-md uppercase px-6 py-4 rounded-xl border border-outline-variant/30 shadow-xs transition-transform active:scale-[0.98] cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Change Format</span>
            </button>
          </div>
          {/* Trust note */}
          <div className="flex items-center gap-2 mt-space-md text-on-tertiary-fixed-variant font-label-sm text-[11px] uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Client-Side Privacy • Photos Stored In Browser Memory Only</span>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none select-none pointer-events-none z-20">
          <svg className="w-full h-16 sm:h-20 md:h-28 block fill-surface-container-low" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path d="M0,205L48,170C96,130,192,54,288,52C384,54,480,130,576,140C672,150,768,92,864,82C960,72,1056,110,1152,148C1248,185,1344,224,1392,242L1440,260L1440,320L0,320Z" />
          </svg>
        </div>
      </section>

      {/* Retake Modal */}
      {retakePoseIndex !== null && (
        <RetakeModal
          poseIndex={retakePoseIndex}
          isOpen={true}
          onClose={() => setRetakePoseIndex(null)}
        />
      )}

      {/* Unified Footer */}
      <Footer hideWave />
    </div>
  );
}
