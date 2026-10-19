'use client';

import { X, Loader2, Sparkles } from 'lucide-react';
import type { LayoutItem } from '../types';
import { getLayoutDimensionsByPoseCount } from '../types';

interface EditLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLayout: LayoutItem | null;
  setEditingLayout: React.Dispatch<React.SetStateAction<LayoutItem | null>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const COMMON_POSE_PRESETS = [2, 3, 4, 6, 8];

export function EditLayoutModal({
  isOpen,
  onClose,
  editingLayout,
  setEditingLayout,
  onSubmit,
  isSubmitting,
}: EditLayoutModalProps) {
  if (!isOpen || !editingLayout) return null;

  const currentDim = getLayoutDimensionsByPoseCount(editingLayout.photo_count);

  const handlePhotoCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(12, count));
    const dim = getLayoutDimensionsByPoseCount(validCount);
    setEditingLayout({
      ...editingLayout,
      photo_count: validCount,
      canvas_width: dim.canvas_width,
      canvas_height: dim.canvas_height,
      aspect_ratio: dim.aspect_ratio,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-[var(--font-vollkorn)] text-2xl font-bold text-primary">
              Edit Format Layout
            </h2>
            <span className="font-mono text-[10px] text-on-surface-variant">
              ID: {editingLayout.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* 1. Count Pose Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
              Jumlah Pose Foto (Count Pose)
            </label>
            <div className="flex items-center gap-1.5 mb-2">
              {COMMON_POSE_PRESETS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handlePhotoCountChange(cnt)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    editingLayout.photo_count === cnt
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  {cnt} Pose
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={12}
                required
                value={editingLayout.photo_count}
                onChange={(e) => handlePhotoCountChange(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface font-bold"
              />
              <span className="text-xs text-on-surface-variant whitespace-nowrap font-medium">
                slot foto
              </span>
            </div>
          </div>

          {/* 2. Auto Configured Dimensions Card */}
          <div className="p-3.5 rounded-2xl bg-secondary-container/20 border border-secondary/20 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-primary block">
                  Konfigurasi Kanvas Otomatis
                </span>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Kanvas: <strong className="text-on-surface">{currentDim.canvas_width} × {currentDim.canvas_height} px</strong> • Rasio: <strong className="text-on-surface">{currentDim.aspect_ratio}</strong>
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider shrink-0">
              Auto
            </span>
          </div>

          {/* 3. Display Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
              Nama Tampilan Format
            </label>
            <input
              type="text"
              required
              value={editingLayout.name}
              onChange={(e) => setEditingLayout({ ...editingLayout, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
            />
          </div>

          {/* 4. Active Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={editingLayout.is_active}
              onChange={(e) =>
                setEditingLayout({ ...editingLayout, is_active: e.target.checked })
              }
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="edit_is_active" className="text-xs font-bold text-on-surface cursor-pointer">
              Format Aktif (Tampil di bilik studio photobooth)
            </label>
          </div>

          {/* 5. Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
