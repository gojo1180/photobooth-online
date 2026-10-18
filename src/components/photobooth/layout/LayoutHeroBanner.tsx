'use client';

export function LayoutHeroBanner() {
  return (
    <section className="relative w-full bg-secondary-container text-on-secondary-container pt-8 sm:pt-12 pb-32 sm:pb-36 md:pb-44 overflow-hidden">
      {/* Retro Sunburst Embellishment */}
      <div className="absolute -right-16 -top-16 w-64 h-64 opacity-10 pointer-events-none">
        <svg
          className="w-full h-full animate-spin [animation-duration:45s] fill-current"
          viewBox="0 0 200 200"
        >
          <path d="M100 0 L107 80 L180 30 L120 93 L200 100 L120 107 L180 170 L107 120 L100 200 L93 120 L20 170 L80 107 L0 100 L80 93 L20 30 L93 80 Z" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
        <h1 className="w-full break-words font-headline-lg text-headline-lg text-on-secondary-container uppercase tracking-tight max-w-2xl font-serif">
          SELECT PRINT LAYOUT
        </h1>
        <p className="font-body-lg text-body-lg text-on-secondary-container/90 mt-space-xs max-w-xl font-serif">
          Choose your signature layout before stepping in front of the lens. All formats are exported in archival 300 DPI quality.
        </p>

        {/* Stepper Pills */}
        <div className="flex flex-wrap items-center justify-center gap-space-xs mt-space-md">
          <span className="bg-primary text-on-primary font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-xs font-bold uppercase">
            1. FORMAT
          </span>
          <span className="hidden sm:inline material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
          <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-space-sm py-1 rounded-full uppercase font-medium">
            2. CAPTURE
          </span>
          <span className="hidden sm:inline material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
          <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-space-sm py-1 rounded-full uppercase font-medium">
            3. EDIT &amp; FRAMES
          </span>
          <span className="hidden sm:inline material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
          <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-space-sm py-1 rounded-full uppercase font-medium">
            4. PRINT &amp; EXPORT
          </span>
        </div>
      </div>

      {/* Fluid Organic Wave Divider to Linen Surface */}
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
  );
}
