'use client';

import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { PHOTO_FILTERS } from '@/lib/konva-helpers';
import { Sliders, Wand2 } from 'lucide-react';

export function FilterBar() {
  const { activeFilter, setActiveFilter } = usePhotoboothStore();

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sliders className="w-4 h-4 text-primary" />
        <h3 className="font-[var(--font-vollkorn)] text-lg font-bold text-on-surface">
          Color Grade &amp; Filters
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(PHOTO_FILTERS).map(([key, item]) => {
          const isSelected = activeFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${isSelected
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-low'
                }`}
            >
              <Wand2 className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
