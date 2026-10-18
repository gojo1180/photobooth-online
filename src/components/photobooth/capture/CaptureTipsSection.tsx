'use client';

interface CaptureTipsSectionProps {
  onProceedToEditor: () => void;
  onChangeFormat: () => void;
}

export function CaptureTipsSection({
  onProceedToEditor,
  onChangeFormat,
}: CaptureTipsSectionProps) {
  return (
    <>
      {/* WAVE DIVIDER: Cream Surface to Cobalt Blue Quote Panel */}
      <div className="w-full text-primary bg-background leading-none overflow-hidden select-none -mb-[1px]">
        <svg className="w-full h-16 sm:h-20 md:h-28 block fill-current" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
        </svg>
      </div>

      {/* COBALT BLUE INTERACTIVE TIPS PANEL */}
      <section className="w-full bg-primary text-on-primary py-space-xl px-margin relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md uppercase shadow-xs mb-space-sm font-bold border border-white/20">
            <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
            PRO TIPS FOR NATURAL POSES
          </span>

          <h3 className="font-headline-lg text-headline-lg text-on-primary mb-space-sm tracking-tight font-serif">
            &ldquo;The most memorable photos happen when you let go and laugh spontaneously.&rdquo;
          </h3>
          <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl mb-space-lg italic">
            Try looking at each other, giving joyful high-fives, or striking goofy faces before the countdown hits zero!
          </p>

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
              onClick={onProceedToEditor}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-headline-md text-label-md uppercase px-8 py-4 rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer font-bold"
            >
              <span>PROCEED TO FRAME EDITOR</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={onChangeFormat}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface text-on-surface font-label-md text-label-md uppercase px-6 py-4 rounded-xl border border-outline-variant/30 shadow-xs transition-transform active:scale-[0.98] cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Change Format</span>
            </button>
          </div>
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
    </>
  );
}
