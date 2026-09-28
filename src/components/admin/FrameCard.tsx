'use client';
 
import { useState } from 'react';
import { type FrameItem } from '@/stores/usePhotoboothStore';
import { normalizeAssetUrl } from '@/lib/api';
import { Layers, CheckCircle2, XCircle, Edit2, Trash2, ToggleLeft, ToggleRight, ImageOff } from 'lucide-react';

export interface FrameWithStatus extends FrameItem {
  is_active?: boolean;
}

interface FrameCardProps {
  frame: FrameWithStatus;
  onToggleStatus?: (frame: FrameWithStatus) => void;
  onEdit?: (frame: FrameWithStatus) => void;
  onDelete?: (frame: FrameWithStatus) => void;
}

export function FrameCard({
  frame,
  onToggleStatus,
  onEdit,
  onDelete,
}: FrameCardProps) {
  const [imageError, setImageError] = useState(false);
  const isActive = frame.is_active !== false;
  const resolvedUrl = normalizeAssetUrl(frame.asset_url);

  return (
    <div
      className={`group relative bg-surface-container-lowest rounded-2xl border transition-all duration-200 p-4 shadow-xs hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${
        isActive
          ? 'border-outline-variant/30'
          : 'border-outline-variant/20 opacity-75 bg-surface-container-low/40'
      }`}
    >
      <div>
        {/* Frame Visual Thumbnail */}
        <div className="w-full h-44 rounded-xl bg-surface-container-low border border-outline-variant/20 overflow-hidden flex items-center justify-center p-2 mb-3 relative">
          {!imageError && resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt={frame.name}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/50">
              <ImageOff className="w-6 h-6" />
              <span className="text-[10px] font-bold">Image Preview Error</span>
            </div>
          )}
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
              isActive
                ? 'bg-emerald-500/90 text-white shadow-xs'
                : 'bg-zinc-700/80 text-zinc-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Frame Details */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h4 className="font-[var(--font-vollkorn)] font-bold text-base text-primary truncate" title={frame.name}>
              {frame.name}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container border border-outline-variant/20 font-mono shrink-0">
              {frame.layout_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <Layers className="w-3.5 h-3.5 text-secondary" />
            <span>
              {frame.slots.length} Photo {frame.slots.length === 1 ? 'Slot' : 'Slots'} Configured
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleStatus?.(frame)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
            isActive
              ? 'text-emerald-700 hover:bg-emerald-50'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
          title="Toggle Active Status"
        >
          {isActive ? (
            <ToggleRight className="w-4 h-4 text-emerald-600" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-zinc-400" />
          )}
          <span className="text-[11px]">{isActive ? 'Live' : 'Hidden'}</span>
        </button>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(frame)}
              className="p-1.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
              title="Edit Frame Details"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(frame)}
              className="p-1.5 rounded-xl text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Frame"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
