'use client';

import { useState } from 'react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { RetakeModal } from '@/components/photobooth/RetakeModal';
import { FramePicker } from '@/components/photobooth/FramePicker';
import { Footer } from '@/components/common/Footer';
import { CanvasStage } from '@/components/photobooth/CanvasStage';

// Self-contained artisanal SVG data URIs for reliable offline fallback photos
const createFallbackPhoto = (label: string, bg: string, text: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='600' height='800' fill='${encodeURIComponent(bg)}'/><circle cx='300' cy='320' r='110' fill='${encodeURIComponent(text)}' opacity='0.2'/><circle cx='300' cy='290' r='80' fill='${encodeURIComponent(text)}' opacity='0.3'/><ellipse cx='300' cy='560' rx='170' ry='130' fill='${encodeURIComponent(text)}' opacity='0.25'/><text x='300' y='305' font-family='sans-serif' font-size='28' font-weight='800' fill='${encodeURIComponent(text)}' text-anchor='middle'>${encodeURIComponent(label)}</text><text x='300' y='345' font-family='sans-serif' font-size='16' font-weight='600' fill='${encodeURIComponent(text)}' text-anchor='middle' opacity='0.75'>Photobooth Candid</text></svg>`;

const SAMPLE_FALLBACK_PHOTOS = [
  createFallbackPhoto('Pose #1', '#fef08a', '#2E0F15'),
  createFallbackPhoto('Pose #2', '#fce7f3', '#541b44'),
  createFallbackPhoto('Pose #3', '#d2f17c', '#2E0F15'),
  createFallbackPhoto('Pose #4', '#e0e7ff', '#1230c7'),
  createFallbackPhoto('Pose #5', '#fed7aa', '#7c2d12'),
  createFallbackPhoto('Pose #6', '#fae8ff', '#581c87'),
];

interface FilterOption {
  key: string;
  name: string;
  subLabel: string;
  icon: string;
  cssClass: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: 'natural',
    name: 'Natural Glow',
    subLabel: 'Warm Neutral',
    icon: 'wb_sunny',
    cssClass: 'contrast-[1.05] brightness-[1.02] saturate-[1.05]',
  },
  {
    key: 'bw',
    name: 'Classic Monochrome',
    subLabel: 'Deep Grain',
    icon: 'contrast',
    cssClass: 'grayscale contrast-125',
  },
  {
    key: 'honey',
    name: '90s Warm Grain',
    subLabel: 'Golden Amber',
    icon: 'save_as',
    cssClass: 'sepia-[0.35] brightness-105 contrast-105',
  },
  {
    key: 'dreamy',
    name: 'Blush Velvet',
    subLabel: 'Pastel Haze',
    icon: 'filter_vintage',
    cssClass: 'brightness-110 saturate-90 contrast-95',
  },
];

interface FrameOption {
  key: string;
  name: string;
  subLabel: string;
  cardBgClass: string;
  wrapBgClass: string;
  swatchOuterClass: string;
  swatchInnerClass: string;
  textColorClass?: string;
}

const FRAME_OPTIONS: FrameOption[] = [
  {
    key: 'cream',
    name: 'Classic Cream',
    subLabel: 'Warm Linen',
    cardBgClass: 'bg-surface-container-lowest border-2 border-primary',
    wrapBgClass: 'bg-[#FDF9F3]',
    swatchOuterClass: 'bg-surface-container-lowest border border-primary',
    swatchInnerClass: 'bg-secondary-container/20 border border-primary',
    textColorClass: 'text-primary',
  },
  {
    key: 'pink',
    name: 'Powder Pink',
    subLabel: 'Sweet Blush',
    cardBgClass: 'bg-[#FDE2E8] border-2 border-primary',
    wrapBgClass: 'bg-[#FDE2E8]',
    swatchOuterClass: 'bg-[#FDE2E8] border border-primary',
    swatchInnerClass: 'bg-tertiary-fixed border border-primary',
    textColorClass: 'text-primary',
  },
  {
    key: 'butter',
    name: 'Butter Yellow',
    subLabel: 'Retro Sun',
    cardBgClass: 'bg-[#FEF08A] border-2 border-primary',
    wrapBgClass: 'bg-[#FEF08A]',
    swatchOuterClass: 'bg-[#FEF08A] border border-primary',
    swatchInnerClass: 'bg-[#FDE2E8] border border-primary',
    textColorClass: 'text-on-surface',
  },
  {
    key: 'cherry',
    name: 'Dark Cherry',
    subLabel: 'Editorial Noir',
    cardBgClass: 'bg-[#24131d] border-2 border-secondary-container text-[#FDF9F3]',
    wrapBgClass: 'bg-[#24131d]',
    swatchOuterClass: 'bg-[#24131d] border border-secondary-container',
    swatchInnerClass: 'bg-secondary-container',
    textColorClass: 'text-[#FDF9F3]',
  },
];

export function StudioEditor() {
  const {
    capturedPhotos,
    selectedLayoutId,
    expectedPhotoCount,
    setStep,
    selectedFrame,
    activeFilter,
    setActiveFilter,
    frameThemeKey,
    setFrameThemeKey,
    cardCaption,
    setCardCaption,
    showDateStamp,
    setShowDateStamp,
    dateStampText,
    setDateStampText,
  } = usePhotoboothStore();

  const [activeFilterKey, setActiveFilterKey] = useState<string>(activeFilter || 'natural');
  const [previewMode, setPreviewMode] = useState<'sheet' | 'canvas'>('canvas');
  const [retakePoseIndex, setRetakePoseIndex] = useState<number | null>(null);

  const totalSlots = expectedPhotoCount || 4;
  const currentFilter = FILTER_OPTIONS.find((f) => f.key === activeFilterKey) || FILTER_OPTIONS[0];
  const currentFrame = FRAME_OPTIONS.find((fr) => fr.key === frameThemeKey) || FRAME_OPTIONS[0];

  const handleSelectFilter = (key: string) => {
    setActiveFilterKey(key);
    setActiveFilter(key);
  };

  const getGridClasses = () => {
    switch (selectedLayoutId) {
      case 'layout_3_strip':
        return 'grid-cols-1 gap-2 max-w-[260px]';
      case 'layout_2_polaroid':
        return 'grid-cols-1 gap-3 max-w-[320px]';
      case 'layout_6_collage':
        return 'grid-cols-2 gap-2 max-w-[360px]';
      case 'layout_4_grid':
      default:
        return 'grid-cols-2 gap-2 max-w-[320px]';
    }
  };

  const getSlotAspect = () => {
    switch (selectedLayoutId) {
      case 'layout_3_strip':
      case 'layout_2_polaroid':
      case 'layout_6_collage':
        return 'aspect-[4/3]';
      case 'layout_4_grid':
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-on-surface">
      {/* TOP DECORATIVE HERO ARC (Warm Mustard Amber Hero Arc) */}
      <section className="w-full bg-secondary-container text-on-secondary relative pt-8 sm:pt-12 pb-28 sm:pb-32 md:pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-margin relative z-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-1 rounded-full shadow-xs border border-outline-variant/30 mb-space-sm font-bold">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_fix_high</span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
              STEP 03 / 04 • STUDIO FINAL TOUCH
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-primary leading-tight max-w-2xl drop-shadow-sm uppercase font-serif">
            Curate Filters &amp; Frame Design
          </h1>
          <p className="font-body-md text-body-md text-on-secondary-container mt-2 max-w-xl">
            Fine-tune vintage color grades, select your signature scrapbook border, and add an archival date stamp.
          </p>
        </div>

        {/* Scallop Wave Divider Downward */}
        <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
          <svg
            className="w-full h-14 sm:h-18 md:h-24 block fill-background"
            preserveAspectRatio="none"
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
          </svg>
        </div>
      </section>

      {/* MAIN STUDIO WORKSPACE: 2-COLUMN BALANCED LAYOUT */}
      <section className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT COLUMN (5 Cols): Tangible Print Sheet Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Toggle Badge Above Preview */}
            <div className="w-full flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  {totalSlots} Poses • {selectedLayoutId?.replace('layout_', '').toUpperCase() || 'GRID'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setPreviewMode('sheet')}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    previewMode === 'sheet'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Quick Mockup
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('canvas')}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    previewMode === 'canvas'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Final Export
                </button>
              </div>
            </div>

            {previewMode === 'canvas' ? (
              <div className="w-full flex justify-center">
                <CanvasStage
                  frame={selectedFrame}
                  photos={capturedPhotos}
                  filterKey={activeFilter}
                />
              </div>
            ) : (
              /* The Physical Sheet Card */
              <div
                id="print-sheet-frame"
                className={`w-full max-w-[420px] p-space-md shadow-xl transition-all duration-300 relative flex flex-col rounded-xl border border-outline-variant/30 ${
                  currentFrame.cardBgClass
                } ${currentFrame.textColorClass || ''}`}
              >
                {/* Artisanal Corner Decals */}
                <div className="absolute -top-3 -left-3 bg-secondary-container text-on-secondary px-2.5 py-1 rounded-full shadow-xs font-label-sm text-label-sm rotate-[-8deg] flex items-center gap-1 z-20 font-bold border border-white/20">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span>SNAP #{totalSlots}</span>
                </div>
                <div className="absolute -bottom-3 -right-2 bg-tertiary-fixed text-tertiary px-3 py-1 rounded-full shadow-xs font-label-sm text-label-sm rotate-[5deg] z-20 font-bold border border-white/20">
                  ♥ sweet memories
                </div>

                {/* Dynamic Photo Mosaic Grid */}
                <div
                  id="photo-tile-wrap"
                  className={`grid mx-auto w-full p-2 transition-colors duration-300 ${getGridClasses()} ${currentFrame.wrapBgClass}`}
                >
                  {Array.from({ length: totalSlots }).map((_, i) => {
                    const photoSrc = capturedPhotos[i] || SAMPLE_FALLBACK_PHOTOS[i] || SAMPLE_FALLBACK_PHOTOS[0];
                    const poseNum = i + 1;

                    return (
                      <div
                        key={i}
                        className={`relative group ${getSlotAspect()} overflow-hidden bg-surface-container-highest rounded border border-black/10`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          id={`preview-photo-${poseNum}`}
                          className={`w-full h-full object-cover transition-all duration-300 ${currentFilter.cssClass}`}
                          src={photoSrc}
                          alt={`Preview Pose #${poseNum}`}
                        />
                        <div className="absolute top-1.5 left-1.5 bg-on-background/70 backdrop-blur-sm text-on-primary font-label-sm text-label-sm px-1.5 py-0.5 rounded font-bold">
                          #0{poseNum}
                        </div>
                        <button
                          onClick={() => setRetakePoseIndex(i)}
                          type="button"
                          className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-primary font-label-sm text-label-sm uppercase gap-1 cursor-pointer font-bold backdrop-blur-[1px]"
                        >
                          <span className="material-symbols-outlined text-[16px]">refresh</span> Retake
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Footer Area of Physical Print */}
                <div className="mt-space-sm pt-space-xs flex items-end justify-between px-1">
                  <div>
                    <p
                      id="card-caption-display"
                      className="font-headline-md text-headline-md tracking-tight font-serif"
                    >
                      {cardCaption || 'Scribblepie Studio'}
                    </p>
                    <p className="font-label-sm text-[10px] uppercase tracking-widest opacity-80 font-bold">
                      Snapbooth Keepsake Archive
                    </p>
                  </div>
                  {showDateStamp && (
                    <div className="text-right">
                      <p className="font-label-sm text-[11px] font-mono tracking-wider font-bold">
                        {dateStampText}
                      </p>
                      <p className="font-label-sm text-[9px] uppercase tracking-widest opacity-70">
                        VOL. 02 • STUDIO
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Status Note */}
            <div className="mt-space-md text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                Active Filter: {currentFilter.name} • Frame: {selectedFrame?.name || currentFrame.name}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Studio Editor Controls */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            {/* MODULE 1: Filter Bar */}
            <div className="bg-surface-container-lowest p-space-md shadow-sm rounded-xl border border-outline-variant/30">
              <div className="flex items-center justify-between mb-space-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                    1
                  </span>
                  <h2 className="font-headline-md text-headline-md text-primary font-serif">
                    Retro Color Grades &amp; Filters
                  </h2>
                </div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                  4 PRESETS
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Curated digicam tones inspired by nostalgic 90s film photography.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
                {FILTER_OPTIONS.map((f) => {
                  const isSelected = activeFilterKey === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => handleSelectFilter(f.key)}
                      type="button"
                      className={`filter-btn p-space-sm rounded-lg text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary-container text-on-primary border-primary shadow-xs scale-[1.02]'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary mx-auto flex items-center justify-center mb-1 shadow-xs">
                        <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
                      </div>
                      <p className={`font-label-md text-label-md font-bold ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                        {f.name}
                      </p>
                      <span className={`font-label-sm text-[11px] ${isSelected ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                        {f.subLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MODULE 2: Frame Templates Library */}
            <div className="bg-surface-container-lowest p-space-md shadow-sm rounded-xl border border-outline-variant/30">
              <div className="flex items-center justify-between mb-space-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                    2
                  </span>
                  <h2 className="font-headline-md text-headline-md text-primary font-serif">
                    Signature Frame Templates
                  </h2>
                </div>
                <span
                  id="active-frame-label"
                  className="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed px-2.5 py-1 rounded-full uppercase font-bold"
                >
                  {selectedFrame?.name || currentFrame.name}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                Templates filtered to match your selected layout ({selectedLayoutId || 'layout_4_grid'}).
              </p>

              <div className="mb-4">
                <FramePicker />
              </div>

              <div className="border-t border-outline-variant/30 pt-3">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-2 font-bold uppercase tracking-wider">
                  Matte &amp; Border Palette
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
                  {FRAME_OPTIONS.map((frame) => {
                    const isSelected = frameThemeKey === frame.key;
                    return (
                      <button
                        key={frame.key}
                        onClick={() => setFrameThemeKey(frame.key)}
                        type="button"
                        className={`frame-btn text-left p-space-xs rounded-lg transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-surface-container-high border-primary shadow-xs'
                            : 'bg-surface-container hover:bg-surface-container-high border-transparent'
                        }`}
                      >
                        <div
                          className={`h-9 w-full rounded flex items-center justify-center mb-1.5 ${frame.swatchOuterClass}`}
                        >
                          <div className={`w-5 h-4 rounded-sm ${frame.swatchInnerClass}`} />
                        </div>
                        <p className={`font-label-md text-label-md font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {frame.name}
                        </p>
                        <p className="font-label-sm text-[10px] text-on-surface-variant">
                          {frame.subLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MODULE 3 & 4 (Side by Side in Right Column) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* MODULE 3: Retake Pose */}
              <div className="bg-surface-container-lowest p-space-md shadow-sm rounded-xl flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                      3
                    </span>
                    <h3 className="font-headline-md text-headline-md text-primary font-serif">
                      Retake Pose
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                    Want a better shot? Retake any individual photo without resetting your session.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: totalSlots }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRetakePoseIndex(i)}
                      type="button"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-surface-container hover:bg-primary hover:text-on-primary transition-colors rounded-lg font-label-sm text-label-sm uppercase cursor-pointer font-bold border border-outline-variant/20 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span> Pose #{i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* MODULE 4: Caption & Timestamp */}
              <div className="bg-surface-container-lowest p-space-md shadow-sm rounded-xl flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                      4
                    </span>
                    <h3 className="font-headline-md text-headline-md text-primary font-serif">
                      Caption &amp; Date
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-xs">
                    Personalize the editorial typography on your print footer.
                  </p>
                </div>
                <div className="space-y-space-xs mt-2">
                  <div>
                    <label
                      className="font-label-sm text-label-sm uppercase text-on-surface-variant block mb-1 font-bold"
                      htmlFor="caption-input"
                    >
                      Photostrip Caption
                    </label>
                    <input
                      id="caption-input"
                      maxLength={32}
                      value={cardCaption}
                      onChange={(e) => setCardCaption(e.target.value)}
                      type="text"
                      className="w-full bg-surface-container px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-bright focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium border border-outline-variant/30"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label
                      className="font-body-sm text-body-sm text-on-surface cursor-pointer select-none font-medium"
                      htmlFor="date-toggle"
                    >
                      Print Vintage Date Stamp
                    </label>
                    <input
                      id="date-toggle"
                      checked={showDateStamp}
                      onChange={(e) => setShowDateStamp(e.target.checked)}
                      type="checkbox"
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </div>
                  {showDateStamp && (
                    <div>
                      <label
                        className="font-label-sm text-label-sm uppercase text-on-surface-variant block mb-1 font-bold"
                        htmlFor="date-stamp-input"
                      >
                        Date Stamp Text
                      </label>
                      <input
                        id="date-stamp-input"
                        maxLength={24}
                        value={dateStampText}
                        onChange={(event) => setDateStampText(event.target.value)}
                        type="text"
                        className="w-full bg-surface-container px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-bright focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium border border-outline-variant/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar: Navigation */}
            <div className="bg-surface-container p-space-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-sm mt-2 shadow-sm border border-outline-variant/30">
              <button
                onClick={() => setStep('CAPTURE')}
                type="button"
                className="inline-flex items-center gap-2 text-on-surface hover:text-primary font-label-md text-label-md uppercase px-space-md py-3 rounded-lg transition-colors w-full sm:w-auto justify-center cursor-pointer font-bold active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Camera</span>
              </button>

              <button
                onClick={() => selectedFrame && setStep('EXPORT')}
                disabled={!selectedFrame}
                type="button"
                className="inline-flex items-center gap-3 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-lg py-3.5 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all w-full sm:w-auto justify-center cursor-pointer font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{selectedFrame ? 'PROCEED TO PRINT & EXPORT' : 'SELECT A FRAME TO CONTINUE'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Editorial Quote */}
      <section className="w-full bg-background pt-space-lg pb-space-xl relative">
        <div className="max-w-3xl mx-auto px-margin text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary mb-space-sm shadow-xs">
            <span className="material-symbols-outlined text-[28px]">format_quote</span>
          </div>
          <blockquote className="font-body-lg text-body-lg italic text-primary leading-relaxed font-serif">
            &ldquo;Scribblepie transformed our spontaneous laughs into an editorial keepsake that feels warm and timeless. Every detail is full of personality.&rdquo;
          </blockquote>
          <p className="font-label-md text-label-md uppercase tracking-wider text-secondary mt-space-sm font-bold">
            NADIA &amp; RENO • STUDIO ARCHIVE VOL. 14
          </p>
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
      <Footer />
    </div>
  );
}
