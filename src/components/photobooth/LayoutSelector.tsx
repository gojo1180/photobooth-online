'use client';

import { useState, useEffect } from 'react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { Footer } from '@/components/common/Footer';
import { getLayouts } from '@/lib/api';

interface FormatCardItem {
  id: string; // matches backend layout id
  key: string;
  name: string;
  poses: number;
  formatType: 'strip' | 'square' | 'postcard' | 'collage';
  sizeLabel: string;
  sizeIcon: string;
  description: string;
  dockIcon: string;
  assetUrl: string;
  previewAlt: string;
  tag?: string;
  tagColor?: string;
}

const FORMATS: FormatCardItem[] = [
  {
    id: 'layout_3_strip',
    key: 'strip',
    name: 'Classic Photostrip (3 Poses)',
    poses: 3,
    formatType: 'strip',
    sizeLabel: '5 x 15 cm Photostrip',
    sizeIcon: 'history_edu',
    description: 'Nostalgic vertical photostrip that slides effortlessly into phone cases, book corners, and keepsake envelopes.',
    dockIcon: 'view_stream',
    assetUrl: '/frames/y2k_strip_pink.svg',
    previewAlt: 'Classic Y2K 3-Pose Photostrip Frame',
    tag: 'ICONIC',
  },
  {
    id: 'layout_4_grid',
    key: 'square',
    name: 'Square Polaroid Grid (4 Poses - 2x2)',
    poses: 4,
    formatType: 'square',
    sizeLabel: '10 x 10 cm Symmetrical',
    sizeIcon: 'crop_square',
    description: 'The most balanced 2x2 layout. Offers generous space for joyful group shots, duo portraits, and spontaneous expressions.',
    dockIcon: 'grid_view',
    assetUrl: '/frames/y2k_grid_cherry.svg',
    previewAlt: 'Chocolate Cherry 2x2 Grid Frame',
    tag: 'MOST POPULAR',
  },
  {
    id: 'layout_2_polaroid',
    key: 'postcard',
    name: 'Postcard Duo (2 Poses)',
    poses: 2,
    formatType: 'postcard',
    sizeLabel: '10 x 15 cm Postcard',
    sizeIcon: 'view_agenda',
    description: 'Two wide cinematic frames with aesthetic margins for handwritten dates, anniversary notes, or sweet messages.',
    dockIcon: 'view_agenda',
    assetUrl: '/frames/y2k_polaroid_butter.svg',
    previewAlt: 'Buttercream Duo Polaroid Frame',
  },
  {
    id: 'layout_6_collage',
    key: 'collage',
    name: 'Mini Collage (6 Poses)',
    poses: 6,
    formatType: 'collage',
    sizeLabel: 'Mini 6-Grid Collage',
    sizeIcon: 'grid_view',
    description: 'Enjoy 6 candid reactions packed into a single keepsake sheet full of laughter, lively energy, and playful details.',
    dockIcon: 'dashboard',
    assetUrl: '/frames/y2k_collage_lavender.svg',
    previewAlt: 'Lavender Pop 6-Slot Collage Frame',
    tag: 'PARTY EDITION',
  },
];

export function LayoutSelector() {
  const {
    selectedLayoutId,
    selectLayout,
    countdownSeconds,
    setCountdownSeconds,
    soundEnabled,
    setSoundEnabled,
    setStep,
  } = usePhotoboothStore();

  const [formats, setFormats] = useState<FormatCardItem[]>(FORMATS);

  // Find initial active format (default to square/layout_4_grid)
  const initialFormat =
    FORMATS.find((f) => f.id === selectedLayoutId) || FORMATS[1];

  const [selectedFormat, setSelectedFormat] = useState<FormatCardItem>(initialFormat);
  const [timerSeconds, setTimerSeconds] = useState<number>(countdownSeconds || 5);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(soundEnabled);

  // Synchronize layouts live with Go Backend API
  useEffect(() => {
    async function syncBackendLayouts() {
      try {
        const backendData = await getLayouts();
        if (backendData && backendData.length > 0) {
          const merged: FormatCardItem[] = backendData.map((bl) => {
            const fallback = FORMATS.find((f) => f.id === bl.id);
            if (fallback) {
              return {
                ...fallback,
                name: bl.name || fallback.name,
                poses: bl.photo_count || fallback.poses,
              };
            }
            return {
              id: bl.id,
              key: bl.id,
              name: bl.name,
              poses: bl.photo_count,
              formatType: bl.photo_count <= 2 ? 'postcard' : bl.photo_count === 3 ? 'strip' : bl.photo_count === 4 ? 'square' : 'collage',
              sizeLabel: `${Math.round(bl.canvas_width / 100)} x ${Math.round(bl.canvas_height / 100)} cm`,
              sizeIcon: 'grid_view',
              description: `High-resolution ${bl.photo_count}-pose archival canvas format.`,
              dockIcon: 'view_stream',
              assetUrl: '/frames/y2k_grid_cherry.svg',
              previewAlt: bl.name,
              tag: 'STUDIO',
            };
          });

          setFormats(merged);
          // If previous selection isn't in backend list, select first available
          if (!merged.some((m) => m.id === selectedFormat.id)) {
            setSelectedFormat(merged[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load layouts from backend API, using local definitions:', err);
      }
    }

    syncBackendLayouts();
  }, []);

  const handleSelectFormat = (format: FormatCardItem) => {
    setSelectedFormat(format);
  };

  const handleProceed = () => {
    selectLayout(selectedFormat.id, selectedFormat.poses);
    setCountdownSeconds(timerSeconds);
    setSoundEnabled(isSoundOn);
    setStep('CAPTURE');
  };

  return (
    <div className="w-full bg-background font-body-md text-on-surface">
      {/* SECTION 1: Mustard Top Banner with Scallop Wave Break */}
      <section className="relative w-full bg-secondary-container text-on-secondary-container pt-8 sm:pt-12 pb-32 sm:pb-36 md:pb-44 overflow-hidden">
        {/* Subtle Background Retro Sunburst Embellishment */}
        <div className="absolute -right-16 -top-16 w-64 h-64 opacity-10 pointer-events-none">
          <svg
            className="w-full h-full animate-spin [animation-duration:45s] fill-current"
            viewBox="0 0 200 200"
          >
            <path d="M100 0 L107 80 L180 30 L120 93 L200 100 L120 107 L180 170 L107 120 L100 200 L93 120 L20 170 L80 107 L0 100 L80 93 L20 30 L93 80 Z"></path>
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">


          <h1 className="font-headline-lg text-headline-lg text-on-secondary-container uppercase tracking-tight max-w-2xl font-serif">
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
            <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
            <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-space-sm py-1 rounded-full uppercase font-medium">
              2. CAPTURE
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
            <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-space-sm py-1 rounded-full uppercase font-medium">
              3. EDIT &amp; FRAMES
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
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

      {/* SECTION 2: Catalog Showcase / 4 Cards Grid */}
      <section className="w-full bg-background pt-space-xl pb-space-xl relative">
        <div className="max-w-7xl mx-auto px-margin">
          {/* Header text */}
          <div className="text-center mb-space-xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              Studio Layout Options
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary mt-1 font-serif">
              Pick Your Keepsake Dimension
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto mt-2">
              Every format is calibrated to match real photo print dimensions. Click any card to select.
            </p>
          </div>

          {/* Formats Grid: Dynamic Backend Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter items-stretch">
            {formats.map((format) => {
              const isSelected = selectedFormat.id === format.id;
              return (
                <article
                  key={format.id}
                  onClick={() => handleSelectFormat(format)}
                  className={`format-card group cursor-pointer flex flex-col justify-between rounded-xl p-space-sm transition-all duration-300 relative border ${isSelected
                      ? 'selected bg-secondary-fixed text-on-secondary-fixed shadow-md ring-2 ring-primary -translate-y-1 border-primary'
                      : 'bg-surface-container-lowest text-on-surface shadow-sm hover:shadow-md hover:-translate-y-1 border-outline-variant/40 hover:border-primary/40'
                    }`}
                >
                  {/* Badge Ribbon */}
                  {format.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary font-label-sm text-label-sm uppercase px-space-sm py-1 rounded-full shadow-xs flex items-center gap-1 z-30 font-bold tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      <span>{format.tag}</span>
                    </div>
                  )}

                  {/* Frame Showcase Container */}
                  <div className="relative w-full bg-surface-container-low rounded-lg p-space-xs flex flex-col items-center justify-center shadow-inner mt-2 min-h-[220px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="h-44 max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                      alt={format.previewAlt}
                      src={format.assetUrl}
                    />
                  </div>

                  {/* Info Block */}
                  <div className="flex flex-col flex-grow justify-between mt-space-md text-center">
                    <div>
                      <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-1 font-bold">
                        <span className="material-symbols-outlined text-[14px]">{format.sizeIcon}</span>
                        <span>{format.sizeLabel}</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-primary leading-snug font-serif">
                        {format.name}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                        {format.description}
                      </p>
                    </div>

                    <div className="mt-space-md pt-space-xs">
                      <button
                        className={`select-btn w-full font-label-md text-label-md uppercase py-2.5 px-space-sm rounded-lg transition-all font-bold cursor-pointer active:scale-[0.98] ${isSelected
                            ? 'bg-primary text-on-primary shadow-xs flex items-center justify-center gap-1'
                            : 'bg-surface-container text-primary hover:bg-primary hover:text-on-primary border border-outline-variant/30'
                          }`}
                        type="button"
                      >
                        {isSelected ? (
                          <>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>SELECTED FORMAT</span>
                          </>
                        ) : (
                          <span>CHOOSE {format.key.toUpperCase()}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Studio Capture Preferences & Timing Panel */}
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
              className={`timer-option cursor-pointer rounded-xl p-space-md shadow-sm transition-all flex flex-col items-center text-center group border ${timerSeconds === 3
                  ? 'selected bg-tertiary-fixed text-on-tertiary-fixed shadow-md scale-105 border-white/40'
                  : 'bg-surface-container-lowest/15 backdrop-blur hover:bg-surface-container-lowest/25 text-on-primary border-white/10'
                }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md mb-space-sm shadow-xs ${timerSeconds === 3
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
                  <span className="timer-indicator inline-block w-4 h-4 rounded-full bg-surface-container-lowest/40"></span>
                )}
              </div>
            </div>

            {/* Timer Option 2: 5s (Default) */}
            <div
              onClick={() => setTimerSeconds(5)}
              className={`timer-option cursor-pointer rounded-xl p-space-md shadow-sm transition-all flex flex-col items-center text-center group border ${timerSeconds === 5
                  ? 'selected bg-tertiary-fixed text-on-tertiary-fixed shadow-md scale-105 border-white/40'
                  : 'bg-surface-container-lowest/15 backdrop-blur hover:bg-surface-container-lowest/25 text-on-primary border-white/10'
                }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md mb-space-sm shadow-xs ${timerSeconds === 5
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
                  <span className="timer-indicator inline-block w-4 h-4 rounded-full bg-surface-container-lowest/40"></span>
                )}
              </div>
            </div>

            {/* Timer Option 3: 8s */}
            <div
              onClick={() => setTimerSeconds(8)}
              className={`timer-option cursor-pointer rounded-xl p-space-md shadow-sm transition-all flex flex-col items-center text-center group border ${timerSeconds === 8
                  ? 'selected bg-tertiary-fixed text-on-tertiary-fixed shadow-md scale-105 border-white/40'
                  : 'bg-surface-container-lowest/15 backdrop-blur hover:bg-surface-container-lowest/25 text-on-primary border-white/10'
                }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md mb-space-sm shadow-xs ${timerSeconds === 8
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
                  <span className="timer-indicator inline-block w-4 h-4 rounded-full bg-surface-container-lowest/40"></span>
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
              <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-primary-container after:border-surface-dim after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary-container"></div>
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

      {/* SECTION 4: Testimonial Quote in Vollkorn Italic */}
      <section className="w-full bg-background pt-space-lg pb-space-lg relative">
        <div className="max-w-3xl mx-auto px-margin text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary mb-space-sm shadow-xs">
            <span className="material-symbols-outlined text-[28px]">format_quote</span>
          </div>
          <blockquote className="font-body-lg text-body-lg italic text-primary leading-relaxed font-serif">
            &ldquo;The 2x2 square polaroid grid is always our go-to choice. The prints feel substantial, skin tones look warm and natural, and it looks lovely framed right on a work desk!&rdquo;
          </blockquote>
          <div className="mt-space-sm">
            <cite className="not-italic font-label-md text-label-md uppercase tracking-wider text-secondary block font-bold">
              Nabila &amp; Rian • Birthday Keepsake Session
            </cite>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
              14 Snapbooth Prints Collected
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 5: Sticky Action Dock Bar */}
      <aside className="sticky bottom-4 z-40 max-w-4xl mx-auto w-full px-margin my-6">
        <div className="bg-surface-container-lowest text-on-surface rounded-xl p-space-sm sm:p-space-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-sm border border-outline-variant/30">
          {/* Current Selection Summary */}
          <div className="flex items-center gap-space-sm text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-xs border border-outline-variant/20">
              <span className="material-symbols-outlined text-[28px]">{selectedFormat.dockIcon}</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block font-bold">
                READY TO STEP IN
              </span>
              <div className="font-headline-md text-[18px] text-primary leading-tight font-bold font-serif">
                {selectedFormat.name} • {timerSeconds}s Interval
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Camera viewfinder automatically adapts to this layout
              </span>
            </div>
          </div>

          {/* Action Button Direct Action */}
          <div className="flex items-center gap-space-xs w-full sm:w-auto shrink-0">
            <button
              onClick={handleProceed}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-lg py-3.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98] font-bold cursor-pointer"
            >
              <span>PROCEED TO CAMERA ({selectedFormat.poses} POSES)</span>
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Shared Footer Component */}
      <Footer />
    </div>
  );
}
