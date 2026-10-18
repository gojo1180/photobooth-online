'use client';

import { Trash2, Loader2 } from 'lucide-react';
import type { LayoutItem } from '../types';

interface DeleteLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletingLayout: LayoutItem | null;
  onDelete: () => void;
  isSubmitting: boolean;
}

export function DeleteLayoutModal({
  isOpen,
  onClose,
  deletingLayout,
  onDelete,
  isSubmitting,
}: DeleteLayoutModalProps) {
  if (!isOpen || !deletingLayout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-3xl border border-rose-200 p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="font-[var(--font-vollkorn)] text-xl font-bold text-on-surface mb-2">
          Delete Layout?
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
          Are you sure you want to delete <span className="font-bold text-on-surface">"{deletingLayout.name}"</span> ({deletingLayout.id})? Any associated frames might also be removed.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
