'use client';

export function SoloIllustration() {
  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-gradient-to-b from-surface-container-low to-surface-container flex items-center justify-center p-4 border border-outline-variant/20 shadow-inner">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />

      {/* Tangible Physical Filmstrip Card */}
      <div className="landing-print relative group max-w-[130px] w-full flex flex-col items-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105">
        <div className="w-full bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30 flex flex-col items-center">
          {/* Header Stamp */}
          <div className="w-full flex items-center justify-between text-[8px] font-mono font-bold uppercase tracking-wider text-secondary mb-1.5 px-0.5">
            <span>MEMORIES</span>
            <span>VOL. 01</span>
          </div>

          {/* 3 Real Photo Slots */}
          <div className="w-full flex flex-col gap-1.5">
            {[1, 2, 3].map((pose) => (
              <div
                key={pose}
                className="w-full aspect-[4/3] rounded-md overflow-hidden bg-primary/5 border border-outline-variant/20 relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary-container/20 via-transparent to-primary/10" />
                <span className="material-symbols-outlined text-primary/40 text-[20px]">
                  photo_camera
                </span>
                <span className="absolute bottom-1 right-1 text-[7px] font-mono text-on-surface-variant font-bold">
                  0{pose}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Stamp */}
          <div className="mt-2 w-full text-center border-t border-dashed border-outline-variant/30 pt-1">
            <span className="text-[7px] font-bold uppercase tracking-widest text-primary block">
              PHOTOBOOTH ARCHIVE
            </span>
          </div>
        </div>

        {/* Studio Stamp Badge */}
        <div className="absolute -bottom-2.5 -right-3 bg-secondary-container text-on-secondary-fixed px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-extrabold uppercase shadow-sm border border-secondary/20">
          300 DPI Strip
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-xs text-on-surface border border-outline-variant/30 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase font-bold shadow-xs">
        Solo Session
      </div>
      <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-xs text-secondary border border-outline-variant/30 px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-bold shadow-xs">
        <span className="material-symbols-outlined text-[15px]">timer</span>
        <span>3s / 5s / 10s</span>
      </div>
    </div>
  );
}

export function DuoIllustration() {
  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-gradient-to-b from-surface-container-low to-surface-container flex items-center justify-center p-4 border border-outline-variant/20 shadow-inner">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Tangible Twin Companion Polaroid Card */}
      <div className="landing-print landing-print-duo relative group max-w-[200px] w-full bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 drop-shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase tracking-wider text-primary mb-2">
          <span>DUO SYNC</span>
          <span className="inline-flex items-center gap-1 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Side-by-Side Dual Feeds */}
        <div className="grid grid-cols-2 gap-2">
          {/* Host Box */}
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-primary/5 border border-outline-variant/20 relative flex flex-col items-center justify-center p-1">
            <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
              YOU
            </span>
          </div>

          {/* Guest Box */}
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-primary/5 border border-outline-variant/20 relative flex flex-col items-center justify-center p-1">
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed/60 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-tertiary text-[16px]">person_add</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-tertiary">
              FRIEND
            </span>
          </div>
        </div>

        {/* Sync Shutter Indicator */}
        <div className="mt-2.5 pt-1.5 border-t border-dashed border-outline-variant/30 flex items-center justify-between text-[8px] font-mono font-bold uppercase text-on-surface-variant">
          <span>SHUTTER SYNC</span>
          <span className="text-secondary font-bold">1-CLICK BOTH</span>
        </div>

        {/* Floating live tag */}
        <div className="absolute -bottom-2.5 -right-2 bg-primary text-on-primary px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-extrabold uppercase shadow-sm">
          Twin Polaroid
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-xs text-on-surface border border-outline-variant/30 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase font-bold shadow-xs">
        With Companion
      </div>
      <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-xs text-primary border border-outline-variant/30 px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-bold shadow-xs">
        <span className="material-symbols-outlined text-[15px]">wifi</span>
        <span>WebRTC P2P</span>
      </div>
    </div>
  );
}
