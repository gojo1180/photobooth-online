'use client';

import { X, Loader2 } from 'lucide-react';

export interface CreateLayoutParams {
  id: string;
  name: string;
  photo_count: number;
  canvas_width: number;
  canvas_height: number;
  aspect_ratio: string;
  is_active: boolean;
}

interface CreateLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  createForm: CreateLayoutParams;
  setCreateForm: React.Dispatch<React.SetStateAction<CreateLayoutParams>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function CreateLayoutModal({
  isOpen,
  onClose,
  createForm,
  setCreateForm,
  onSubmit,
  isSubmitting,
}: CreateLayoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[var(--font-vollkorn)] text-2xl font-bold text-primary">
            Add Layout Format
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
              Unique Layout ID
            </label>
            <input
              type="text"
              required
              placeholder="layout_4_square"
              value={createForm.id}
              onChange={(e) => setCreateForm({ ...createForm, id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface font-mono"
            />
            <span className="text-[10px] text-on-surface-variant mt-1 block">
              Lowercase snake_case identifier (e.g. layout_3_strip)
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
              Layout Display Name
            </label>
            <input
              type="text"
              required
              placeholder="Vintage 4-Grid Strip"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
                Photo Count
              </label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={createForm.photo_count}
                onChange={(e) =>
                  setCreateForm({ ...createForm, photo_count: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
                Aspect Ratio
              </label>
              <input
                type="text"
                required
                placeholder="1:3, 1:1, 4:3"
                value={createForm.aspect_ratio}
                onChange={(e) => setCreateForm({ ...createForm, aspect_ratio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
                Canvas Width (px)
              </label>
              <input
                type="number"
                min={100}
                required
                value={createForm.canvas_width}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    canvas_width: parseInt(e.target.value, 10) || 600,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
                Canvas Height (px)
              </label>
              <input
                type="number"
                min={100}
                required
                value={createForm.canvas_height}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    canvas_height: parseInt(e.target.value, 10) || 1800,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="create_is_active"
              checked={createForm.is_active}
              onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="create_is_active" className="text-xs font-bold text-on-surface">
              Publish as active immediately
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Layout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
