'use client';

export function CaptureHeaderHero() {
  return (
    <>
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
    </>
  );
}
