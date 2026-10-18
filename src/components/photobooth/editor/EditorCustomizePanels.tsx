'use client';

import { FramePicker } from '@/components/photobooth/FramePicker';
import type { FrameItem } from '@/stores/usePhotoboothStore';
import { FILTER_OPTIONS, FRAME_OPTIONS, type FrameOption } from './types';

interface EditorCustomizePanelsProps {
  activeFilterKey: string;
  onSelectFilter: (key: string) => void;
  selectedFrame: FrameItem | null;
  currentFrame: FrameOption;
  selectedLayoutId: string | null;
  frameThemeKey: string;
  setFrameThemeKey: (key: string) => void;
  totalSlots: number;
  onRetakePose: (index: number) => void;
  cardCaption: string;
  setCardCaption: (val: string) => void;
  showDateStamp: boolean;
  setShowDateStamp: (val: boolean) => void;
  dateStampText: string;
  setDateStampText: (val: string) => void;
  onBackToCamera: () => void;
  onProceedToExport: () => void;
}

export function EditorCustomizePanels({
  activeFilterKey,
  onSelectFilter,
  selectedFrame,
  currentFrame,
  selectedLayoutId,
  frameThemeKey,
  setFrameThemeKey,
  totalSlots,
  onRetakePose,
  cardCaption,
  setCardCaption,
  showDateStamp,
  setShowDateStamp,
  dateStampText,
  setDateStampText,
  onBackToCamera,
  onProceedToExport,
}: EditorCustomizePanelsProps) {
  return (
    <div className="flex flex-col gap-space-md">
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
                onClick={() => onSelectFilter(f.key)}
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
                onClick={() => onRetakePose(i)}
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
          onClick={onBackToCamera}
          type="button"
          className="inline-flex items-center gap-2 text-on-surface hover:text-primary font-label-md text-label-md uppercase px-space-md py-3 rounded-lg transition-colors w-full sm:w-auto justify-center cursor-pointer font-bold active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Camera</span>
        </button>

        <button
          onClick={onProceedToExport}
          disabled={!selectedFrame}
          type="button"
          className="inline-flex items-center gap-3 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-lg py-3.5 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all w-full sm:w-auto justify-center cursor-pointer font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{selectedFrame ? 'PROCEED TO PRINT & EXPORT' : 'SELECT A FRAME TO CONTINUE'}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
