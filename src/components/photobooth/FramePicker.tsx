'use client';

import { useEffect } from 'react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { useFrameFilter } from '@/hooks/useFrameFilter';
import { Sparkles, Check } from 'lucide-react';

export function FramePicker() {
  const { selectedLayoutId, selectedFrame, selectFrame } = usePhotoboothStore();
  const { frames, isLoading } = useFrameFilter(selectedLayoutId);

  // Auto-select first frame if none currently selected
  useEffect(() => {
    if (frames.length > 0 && !selectedFrame) {
      selectFrame(frames[0]);
    }
  }, [frames, selectedFrame, selectFrame]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-secondary" />
        <h3 className="font-serif text-lg font-bold text-primary">
          Frame Templates
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed border border-secondary/20 shadow-xs">
          {frames.length} Available
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-28 h-36 rounded-xl border border-outline-variant/30 bg-surface-container-low animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1">
          {frames.map((frame) => {
            const isSelected = selectedFrame?.id === frame.id;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => selectFrame(frame)}
                className={`relative flex-shrink-0 w-28 text-left rounded-xl p-2 bg-surface-container-lowest border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary shadow-xs -translate-y-0.5 ring-2 ring-primary/20 bg-surface-container-low'
                    : 'border-outline-variant/30 hover:border-primary/50 hover:-translate-y-0.5'
                }`}
              >
                {/* Frame Preview Thumbnail */}
                <div className="w-full h-32 rounded-lg bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center relative">
                  <img
                    src={frame.asset_url}
                    alt={frame.name}
                    className="w-full h-full object-contain p-1"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] font-bold text-on-surface truncate">
                  {frame.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
