'use client';

interface LayoutTimingPreferencesProps {
  timerSeconds: number;
  setTimerSeconds: (sec: number) => void;
  isSoundOn: boolean;
  setIsSoundOn: (val: boolean) => void;
}

export function LayoutTimingPreferences({
  timerSeconds,
  setTimerSeconds,
  isSoundOn,
  setIsSoundOn,
}: LayoutTimingPreferencesProps) {
  return (
    <section className="relative w-full bg-primary-container text-on-primary py-24 sm:py-28 md:py-36 overflow-hidden">
      {/* Fluid Organic Wave from linen to cobalt banner */}
      <div className="absolute -top-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg
          className="relative block w-full h-14 sm:h-18 md:h-24 fill-background"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,0L0,0Z" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-margin relative z-20">
        <div className="text-center mb-space-lg">
          <span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm uppercase px-space-sm py-1 rounded-full shadow-xs mb-space-xs font-bold border border-white/20">
            STUDIO PREFERENCES
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-primary uppercase tracking-tight font-serif">
            SHUTTER TIMING &amp; PACING
          </h2>
          <p className="font-body-md text-body-md text-on-primary-container max-w-lg mx-auto mt-space-xs">
            Adjust your countdown timing so you and your companions have comfortable breathing room between poses.
          </p>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Timer Option 1: 3s */}
          <div
            onClick={() => setTimerSeconds(3)}
            className={`timer-option cursor-pointer rounded-xl p-space-md shadow-sm transition-all flex flex-col items-center text-center group border ${
              timerSeconds === 3
                ? 'selected bg-tertiary-fixed text-on-tertiary-fixed shadow-md scale-105 border-white/40'
                : 'bg-surface-container-lowest/15 backdrop-blur hover:bg-surface-container-lowest/25 text-on-primary border-white/10'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md mb-space-sm shadow-xs ${
                timerSeconds === 3
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest text-primary'
              }`}
            >
              3s
            </div>
            <h3 className={`font-headline-md text-headline-md ${timerSeconds === 3 ? 'text-tertiary' : 'text-on-primary'}`}>
              Express (3 Seconds)
            </h3>
            <p className={`font-body-sm text-body-sm mt-1 ${timerSeconds === 3 ? 'text-on-tertiary-fixed-variant' : 'text-on-primary-container'}`}>
              Spontaneous and rapid pace. Ideal for high energy and burst reactions.
            </p>
            <div className="mt-space-md">
              {timerSeconds === 3 ? (
                <span className="timer-indicator inline-flex items-center justify-center w-5 h-5 rounded-full bg-tertiary text-on-tertiary">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
              ) : (
                <span className="timer-indicator inline-block w-4 h-4 rounded-full bg-surface-container-lowest/40" />
              )}
            </div>
          </div>

          {/* Timer Option 2: 5s */}
          <div
            onClick={() => setTimerSeconds(5)}
            className={`timer-option cursor-pointer rounded-xl p-space-md shadow-sm transition-all flex flex-col items-center text-center group border ${
              timerSeconds === 5
                ? 'selected bg-tertiary-fixed text-on-tertiary-fixed shadow-md scale-105 border-white/40'
                : 'bg-surface-container-lowest/15 backdrop-blur hover:bg-surface-container-lowest/25 text-on-primary border-white/10'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md mb-space-sm shadow-xs ${
                timerSeconds === 5
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest text-primary'
              }`}
            >
              5s
            </div>
            <div className="inline-block bg-primary text-on-primary font-label-sm text-[10px] uppercase px-2 py-0.5 rounded-full mb-1 font-bold">
              RECOMMENDED
            </div>
            <h3 className={`font-headline-md text-headline-md ${timerSeconds === 5 ? 'text-tertiary' : 'text-on-primary'}`}>
              Relaxed (5 Seconds)
            </h3>
            <p className={`font-body-sm text-body-sm mt-1 ${timerSeconds === 5 ? 'text-on-tertiary-fixed-variant' : 'text-on-primary-container'}`}>
              Balanced rhythm to check your expression, fix your hair, and get ready for the shutter.
            </p>
            <div className="mt-space-md">
              {timerSeconds === 5 ? (
                <span className="timer-indicator inline-flex items-center justify-center w-5 h-5 rounded-full bg-tertiary text-on-tertiary">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
              ) : (
                <span className="timer-indicator inline-block w-4 h-4 rounded-full bg-surface-container-lowest/40" />
              )}
            </div>
          </div>

          {/* Timer Option 3: 8s */}
          <div
            onClick={() => setTimerSeconds(8)}
            className={`timer-option cursor-pointer rounded-xl p-space-md shadow-sm transition-all flex flex-col items-center text-center group border ${
              timerSeconds === 8
                ? 'selected bg-tertiary-fixed text-on-tertiary-fixed shadow-md scale-105 border-white/40'
                : 'bg-surface-container-lowest/15 backdrop-blur hover:bg-surface-container-lowest/25 text-on-primary border-white/10'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md mb-space-sm shadow-xs ${
                timerSeconds === 8
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-lowest text-primary'
              }`}
            >
              8s
            </div>
            <h3 className={`font-headline-md text-headline-md ${timerSeconds === 8 ? 'text-tertiary' : 'text-on-primary'}`}>
              Leisurely (8 Seconds)
            </h3>
            <p className={`font-body-sm text-body-sm mt-1 ${timerSeconds === 8 ? 'text-on-tertiary-fixed-variant' : 'text-on-primary-container'}`}>
              Plenty of time to grab party props, silly glasses, or rearrange group formations.
            </p>
            <div className="mt-space-md">
              {timerSeconds === 8 ? (
                <span className="timer-indicator inline-flex items-center justify-center w-5 h-5 rounded-full bg-tertiary text-on-tertiary">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </span>
              ) : (
                <span className="timer-indicator inline-block w-4 h-4 rounded-full bg-surface-container-lowest/40" />
              )}
            </div>
          </div>
        </div>

        {/* Sound Cue Bar */}
        <div className="mt-space-lg bg-surface-container-lowest/15 rounded-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border border-white/10">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined">volume_up</span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-on-primary leading-tight font-bold">
                Countdown Beep &amp; Camera Flash Sound
              </h4>
              <p className="font-body-sm text-body-sm text-on-primary-container">
                Vintage acoustic shutter cue to guide your smile timing in front of the lens.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isSoundOn}
              onChange={(e) => setIsSoundOn(e.target.checked)}
            />
            <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-primary-container after:border-surface-dim after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary-container" />
          </label>
        </div>
      </div>

      {/* Fluid Organic Wave from cobalt back down to linen background */}
      <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg
          className="relative block w-full h-14 sm:h-18 md:h-24 fill-background"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          <path d="M0,205L48,170C96,130,192,54,288,52C384,54,480,130,576,140C672,150,768,92,864,82C960,72,1056,110,1152,148C1248,185,1344,224,1392,242L1440,260L1440,320L0,320Z" />
        </svg>
      </div>
    </section>
  );
}
