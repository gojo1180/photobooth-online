'use client';

interface CaptureViewfinderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  error: string | null;
  isMirrored: boolean;
  toggleMirror: () => void;
  toggleFacingMode: () => void;
  playShutterSound: () => void;
  isCountdown: boolean;
  countdownNum: number;
  capturedPhotos: string[];
}

export function CaptureViewfinder({
  videoRef,
  isReady,
  error,
  isMirrored,
  toggleMirror,
  toggleFacingMode,
  playShutterSound,
  isCountdown,
  countdownNum,
  capturedPhotos,
}: CaptureViewfinderProps) {
  return (
    <>
      {/* Arched Emblem Title Badge */}
      <div className="flex flex-col items-center justify-center -mt-8 mb-space-md relative z-20">
        <div className="relative w-44 h-24 flex items-center justify-center">
          <svg className="w-44 h-24 overflow-visible" viewBox="0 0 200 100">
            <path d="M 15 85 A 85 85 0 0 1 185 85" fill="transparent" id="curve" />
            <text className="font-label-md text-[13px] uppercase fill-secondary font-bold tracking-[0.24em]">
              <textPath href="#curve" startOffset="50%" textAnchor="middle">
                Studio Lens #02
              </textPath>
            </text>
          </svg>
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shadow-xs border border-primary/20">
            <span className="material-symbols-outlined text-[20px]">lens_blur</span>
          </div>
        </div>
      </div>

      {/* DUAL VIEWFINDER TILES */}
      <div className="relative p-space-sm sm:p-space-md bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm relative">
          {/* Feed 1: Main Active Webcam */}
          <div className="relative group rounded-lg overflow-hidden bg-black aspect-[3/4] flex flex-col justify-between p-space-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
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
            {capturedPhotos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src={capturedPhotos[capturedPhotos.length - 1]}
                alt={`Latest Shot: Pose ${capturedPhotos.length}`}
              />
            ) : (
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

          {/* CENTER COUNTDOWN BADGE */}
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
              onClick={playShutterSound}
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
    </>
  );
}
