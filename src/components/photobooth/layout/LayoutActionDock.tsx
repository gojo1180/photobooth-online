'use client';

import type { FormatCardItem } from './types';

interface LayoutActionDockProps {
  selectedFormat: FormatCardItem;
  timerSeconds: number;
  onProceed: () => void;
}

export function LayoutActionDock({
  selectedFormat,
  timerSeconds,
  onProceed,
}: LayoutActionDockProps) {
  return (
    <aside className="sticky bottom-3 sm:bottom-4 z-40 max-w-4xl mx-auto w-full px-3 sm:px-margin my-6">
      <div className="bg-surface-container-lowest text-on-surface rounded-xl p-space-sm sm:p-space-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-sm border border-outline-variant/30">
        {/* Current Selection Summary */}
        <div className="flex items-center gap-space-sm text-left w-full sm:w-auto">
          <div className="w-12 h-12 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-xs border border-outline-variant/20">
            <span className="material-symbols-outlined text-[28px]">{selectedFormat.dockIcon}</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block font-bold">
              READY TO STEP IN
            </span>
            <div className="truncate font-headline-md text-[15px] sm:text-[18px] text-primary leading-tight font-bold font-serif">
              {selectedFormat.name} • {timerSeconds}s Interval
            </div>
            <span className="hidden sm:block font-body-sm text-body-sm text-on-surface-variant">
              Camera viewfinder automatically adapts to this layout
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-space-xs w-full sm:w-auto shrink-0">
          <button
            onClick={onProceed}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-[11px] sm:text-label-md uppercase px-4 sm:px-space-lg py-3.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98] font-bold cursor-pointer"
          >
            <span>PROCEED TO CAMERA ({selectedFormat.poses} POSES)</span>
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
