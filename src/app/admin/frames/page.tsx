'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FrameCard, type FrameWithStatus } from '@/components/admin/FrameCard';
import { DEFAULT_FRAMES } from '@/hooks/useFrameFilter';
import {
  getAdminFrames,
  getFrames,
  getLayouts,
  updateAdminFrame,
  deleteAdminFrame,
  type BackendLayout,
} from '@/lib/api';
import {
  PlusCircle,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ImageIcon,
} from 'lucide-react';

export default function AdminFramesPage() {
  const fallbackFrames: FrameWithStatus[] = Object.values(DEFAULT_FRAMES)
    .flat()
    .map((f) => ({ ...f, is_active: true }));

  const [frames, setFrames] = useState<FrameWithStatus[]>(fallbackFrames);
  const [layouts, setLayouts] = useState<BackendLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState<string>('all');

  // Modal State: Edit Frame
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFrame, setEditingFrame] = useState<FrameWithStatus | null>(null);

  // Modal State: Delete Frame
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFrame, setDeletingFrame] = useState<FrameWithStatus | null>(null);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch layouts for filtering tabs & options
      const fetchedLayouts = await getLayouts().catch(() => []);
      setLayouts(fetchedLayouts);

      // 2. Fetch frames from admin endpoint
      let backendFrames = await getAdminFrames().catch(() => null);

      // If admin endpoint had no frames or failed, try public frames per layout
      if (!backendFrames || backendFrames.length === 0) {
        if (fetchedLayouts && fetchedLayouts.length > 0) {
          const promises = fetchedLayouts.map((l) => getFrames(l.id).catch(() => []));
          const results = await Promise.all(promises);
          backendFrames = results.flat();
        }
      }

      if (backendFrames && backendFrames.length > 0) {
        const mapped: FrameWithStatus[] = backendFrames.map((bf) => {
          const matchedLayout = fetchedLayouts.find((l) => l.id === bf.layout_id);
          return {
            id: bf.id,
            layout_id: bf.layout_id,
            name: bf.name,
            asset_url: bf.asset_url,
            slots: bf.slots,
            canvasWidth:
              matchedLayout?.canvas_width ||
              DEFAULT_FRAMES[bf.layout_id]?.[0]?.canvasWidth ||
              600,
            canvasHeight:
              matchedLayout?.canvas_height ||
              DEFAULT_FRAMES[bf.layout_id]?.[0]?.canvasHeight ||
              1800,
            is_active: bf.is_active,
          };
        });
        setFrames(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch backend frames, showing fallback defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Handlers: Status Toggle ---
  const handleToggleStatus = async (frame: FrameWithStatus) => {
    const newStatus = frame.is_active === false ? true : false;
    try {
      await updateAdminFrame(frame.id, { is_active: newStatus });
      setFrames((prev) =>
        prev.map((f) => (f.id === frame.id ? { ...f, is_active: newStatus } : f))
      );
      showToast(
        'success',
        `Frame "${frame.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status frame.';
      showToast('error', msg);
    }
  };

  // --- Handlers: Edit ---
  const handleOpenEdit = (frame: FrameWithStatus) => {
    setEditingFrame({ ...frame });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFrame) return;

    setIsSubmitting(true);
    try {
      await updateAdminFrame(editingFrame.id, {
        name: editingFrame.name.trim(),
        layout_id: editingFrame.layout_id,
        is_active: editingFrame.is_active,
      });

      showToast('success', `Frame "${editingFrame.name}" berhasil diperbarui!`);
      setIsEditModalOpen(false);
      setEditingFrame(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui frame.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Delete ---
  const handleOpenDelete = (frame: FrameWithStatus) => {
    setDeletingFrame(frame);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingFrame) return;

    setIsSubmitting(true);
    try {
      await deleteAdminFrame(deletingFrame.id);
      showToast('success', `Frame "${deletingFrame.name}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingFrame(null);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus frame.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter frames
  const filteredFrames = frames.filter((frame) => {
    const matchesSearch =
      frame.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frame.layout_id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedLayoutFilter !== 'all' && frame.layout_id !== selectedLayoutFilter) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-2.5 transition-all text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container shadow-xs font-mono">
            ASSET MANAGEMENT
          </span>
          <h1 className="font-[var(--font-vollkorn)] text-3xl md:text-4xl font-bold text-primary mt-2">
            Frame Templates Gallery
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage photobooth frames, visual overlays, and slot coordinates across layout formats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Syncing with backend...</span>
            </div>
          )}
          <Link
            href="/admin/frames/new"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 self-start transition-all active:scale-[0.98] font-[var(--font-space-grotesk)] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Frame &amp; Slot Mapper</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frame name or layout..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Layout Tabs Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedLayoutFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedLayoutFilter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All Layouts ({frames.length})
          </button>
          {layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLayoutFilter(l.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedLayoutFilter === l.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frames Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredFrames.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            onToggleStatus={handleToggleStatus}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      {filteredFrames.length === 0 && !loading && (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 mt-6">
          <ImageIcon className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-on-surface">No frames found</h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Try choosing another layout filter or upload a new frame template.
          </p>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT FRAME */}
      {/* =================================================================== */}
      {isEditModalOpen && editingFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-[var(--font-vollkorn)] text-2xl font-bold text-primary">
                  Edit Frame Metadata
                </h2>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  {editingFrame.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
                  Frame Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editingFrame.name}
                  onChange={(e) => setEditingFrame({ ...editingFrame, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1">
                  Bound Grid Layout
                </label>
                <select
                  value={editingFrame.layout_id}
                  onChange={(e) => setEditingFrame({ ...editingFrame, layout_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
                >
                  {layouts.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.id})
                    </option>
                  ))}
                  {!layouts.some((l) => l.id === editingFrame.layout_id) && (
                    <option value={editingFrame.layout_id}>{editingFrame.layout_id}</option>
                  )}
                </select>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Configured Photo Slots:</span>
                <span className="font-bold text-primary">{editingFrame.slots.length} Slots</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_frame_is_active"
                  checked={editingFrame.is_active !== false}
                  onChange={(e) =>
                    setEditingFrame({ ...editingFrame, is_active: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="edit_frame_is_active" className="text-xs font-bold text-on-surface">
                  Frame Active (Visible in photobooth customizer)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* =================================================================== */}
      {isDeleteModalOpen && deletingFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl border border-rose-200 p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-[var(--font-vollkorn)] text-xl font-bold text-on-surface mb-2">
              Delete Frame Template?
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
              Are you sure you want to permanently delete <span className="font-bold text-on-surface">"{deletingFrame.name}"</span>? Booth sessions relying on this frame will no longer find it.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
