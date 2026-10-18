'use client';

import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { LayoutItem } from '../types';

interface LayoutCardProps {
  layout: LayoutItem;
  onToggleStatus: (layout: LayoutItem) => void;
  onEdit: (layout: LayoutItem) => void;
  onDelete: (layout: LayoutItem) => void;
}

export function LayoutCard({
  layout,
  onToggleStatus,
  onEdit,
  onDelete,
}: LayoutCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
        layout.is_active
          ? 'border-outline-variant/30 hover:border-primary/40 hover:shadow-sm'
          : 'border-outline-variant/20 bg-surface-container-low/40 opacity-75'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            {layout.id}
          </span>
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              layout.is_active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
            }`}
          >
            {layout.is_active ? 'Active' : 'Disabled'}
          </span>
        </div>

        <h3 className="font-bold text-base text-on-surface">{layout.name}</h3>
        {layout.description && (
          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
            {layout.description}
          </p>
        )}

        {/* Specs Grid */}
        <div className="mt-4 pt-3 border-t border-outline-variant/20 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Aspect Ratio
            </span>
            <span className="font-bold text-on-surface">{layout.aspect_ratio}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Photo Required
            </span>
            <span className="font-bold text-primary">{layout.photo_count} Poses</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Canvas Resolution
            </span>
            <span className="font-mono text-xs font-semibold text-on-surface">
              {layout.canvas_width} × {layout.canvas_height} px
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleStatus(layout)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            layout.is_active
              ? 'text-emerald-700 hover:bg-emerald-50'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Toggle Active/Inactive"
        >
          {layout.is_active ? (
            <ToggleRight className="w-4 h-4 text-emerald-600" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-zinc-400" />
          )}
          <span>{layout.is_active ? 'Active' : 'Disabled'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(layout)}
            className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            title="Edit Layout"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(layout)}
            className="p-2 rounded-xl text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Layout"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
