'use client';

import { type FrameOption, type FilterOption, SAMPLE_FALLBACK_PHOTOS } from './types';

interface EditorPrintMockupProps {
  totalSlots: number;
  selectedLayoutId: string | null;
  currentFrame: FrameOption;
  currentFilter: FilterOption;
  capturedPhotos: string[];
  cardCaption: string;
  showDateStamp: boolean;
  dateStampText: string;
  onRetakePose: (index: number) => void;
}

export function EditorPrintMockup({
  totalSlots,
  selectedLayoutId,
  currentFrame,
  currentFilter,
  capturedPhotos,
  cardCaption,
  showDateStamp,
  dateStampText,
  onRetakePose,
}: EditorPrintMockupProps) {
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
                onClick={() => onRetakePose(i)}
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
            {cardCaption || 'NevStudio Studio'}
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
  );
}
