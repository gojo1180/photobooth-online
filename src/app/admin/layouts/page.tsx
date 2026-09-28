'use client';

import { useState, useEffect } from 'react';
import {
  getAdminLayouts,
  getLayouts,
  createAdminLayout,
  updateAdminLayout,
  deleteAdminLayout,
  type BackendLayout,
} from '@/lib/api';
import {
  Loader2,
  Plus,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  LayoutGrid,
} from 'lucide-react';

interface LayoutItem extends BackendLayout {
  description?: string;
}

const FALLBACK_LAYOUTS: LayoutItem[] = [
  {
    id: 'layout_3_strip',
    name: 'Classic 3-Strip',
    photo_count: 3,
    canvas_width: 480,
    canvas_height: 1400,
    aspect_ratio: '1:3',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Mall photobooth vertical film strip with header & footer stamps',
  },
  {
    id: 'layout_4_grid',
    name: 'Editorial 2x2 Grid',
    photo_count: 4,
    canvas_width: 800,
    canvas_height: 960,
    aspect_ratio: '1:1',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Four-quadrant magazine grid with center sticker pin seal',
  },
  {
    id: 'layout_2_polaroid',
    name: 'Duo Polaroid Postcard',
    photo_count: 2,
    canvas_width: 600,
    canvas_height: 900,
    aspect_ratio: '2:3',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Two wide cinematic frames with aesthetic margins for dates and notes',
  },
  {
    id: 'layout_6_collage',
    name: 'Mini Collage (6 Pose)',
    photo_count: 6,
    canvas_width: 800,
    canvas_height: 1150,
    aspect_ratio: '2:3',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Compact 6-quadrant collage for friends and party shoots',
  },
];

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState<LayoutItem[]>(FALLBACK_LAYOUTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State: Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: '',
    name: '',
    photo_count: 3,
    canvas_width: 480,
    canvas_height: 1400,
    aspect_ratio: '1:3',
    is_active: true,
  });

  // Modal State: Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<LayoutItem | null>(null);

  // Modal State: Delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLayout, setDeletingLayout] = useState<LayoutItem | null>(null);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadLayouts = async () => {
    setLoading(true);
    try {
      // Try admin endpoint first
      let data: BackendLayout[] = [];
      try {
        data = await getAdminLayouts();
      } catch {
        // Fallback to public active layouts
        data = await getLayouts();
      }

      if (data && data.length > 0) {
        setLayouts(data);
      }
    } catch (err) {
      console.warn('Failed to load layouts from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayouts();
  }, []);

  // --- Handlers: Create ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: createForm.id.trim().toLowerCase().replace(/\s+/g, '_'),
        name: createForm.name.trim(),
        photo_count: Number(createForm.photo_count),
        canvas_width: Number(createForm.canvas_width),
        canvas_height: Number(createForm.canvas_height),
        aspect_ratio: createForm.aspect_ratio.trim(),
        is_active: createForm.is_active,
      };

      await createAdminLayout(payload);
      showToast('success', `Layout "${payload.name}" berhasil dibuat!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        id: '',
        name: '',
        photo_count: 3,
        canvas_width: 480,
        canvas_height: 1400,
        aspect_ratio: '1:3',
        is_active: true,
      });
      await loadLayouts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat layout.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Edit ---
  const openEditModal = (layout: LayoutItem) => {
    setEditingLayout({ ...layout });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLayout) return;

    setIsSubmitting(true);
    try {
      await updateAdminLayout(editingLayout.id, {
        name: editingLayout.name.trim(),
        photo_count: Number(editingLayout.photo_count),
        canvas_width: Number(editingLayout.canvas_width),
        canvas_height: Number(editingLayout.canvas_height),
        aspect_ratio: editingLayout.aspect_ratio.trim(),
        is_active: editingLayout.is_active,
      });

      showToast('success', `Layout "${editingLayout.name}" berhasil diperbarui!`);
      setIsEditModalOpen(false);
      setEditingLayout(null);
      await loadLayouts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui layout.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Toggle Status ---
  const handleToggleStatus = async (layout: LayoutItem) => {
    const newStatus = !layout.is_active;
    try {
      await updateAdminLayout(layout.id, { is_active: newStatus });
      setLayouts((prev) =>
        prev.map((l) => (l.id === layout.id ? { ...l, is_active: newStatus } : l))
      );
      showToast(
        'success',
        `Layout "${layout.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status layout.';
      showToast('error', msg);
    }
  };

  // --- Handlers: Delete ---
  const openDeleteModal = (layout: LayoutItem) => {
    setDeletingLayout(layout);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingLayout) return;

    setIsSubmitting(true);
    try {
      await deleteAdminLayout(deletingLayout.id);
      showToast('success', `Layout "${deletingLayout.name}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingLayout(null);
      await loadLayouts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus layout.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered layouts
  const filteredLayouts = layouts.filter((layout) => {
    const matchesSearch =
      layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layout.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterActive === 'active') return layout.is_active;
    if (filterActive === 'inactive') return !layout.is_active;
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
            STUDIO CONFIGURATION
          </span>
          <h1 className="font-[var(--font-vollkorn)] text-3xl md:text-4xl font-bold text-primary mt-2">
            Grid Layout Manager
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Create, update, and manage photobooth grid dimensions and format configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Syncing Live...</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Layout</span>
          </button>
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
            placeholder="Search layout name or ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterActive === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All ({layouts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterActive === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Active ({layouts.filter((l) => l.is_active).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterActive === 'inactive'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Inactive ({layouts.filter((l) => !l.is_active).length})
          </button>
        </div>
      </div>

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLayouts.map((layout) => (
          <div
            key={layout.id}
            className={`bg-surface-container-lowest rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md ${
              layout.is_active
                ? 'border-outline-variant/30'
                : 'border-outline-variant/20 opacity-75 bg-surface-container-low/50'
            }`}
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary border border-outline-variant/20 text-[10px] font-bold font-mono">
                  {layout.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    layout.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                  }`}
                >
                  {layout.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Title & Specs */}
              <h3 className="font-[var(--font-vollkorn)] text-xl font-bold text-primary mb-1">
                {layout.name}
              </h3>
              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                {layout.description || 'Active photobooth canvas template synchronized from Go Backend.'}
              </p>

              {/* Canvas Dimension Chips */}
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
                onClick={() => handleToggleStatus(layout)}
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
                  onClick={() => openEditModal(layout)}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                  title="Edit Layout"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(layout)}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Layout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLayouts.length === 0 && !loading && (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 mt-6">
          <LayoutGrid className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-on-surface">No layout formats found</h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Try adjusting your search or add a new layout grid.
          </p>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CREATE LAYOUT */}
      {/* =================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[var(--font-vollkorn)] text-2xl font-bold text-primary">
                Add Layout Format
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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
                  onClick={() => setIsCreateModalOpen(false)}
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
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT LAYOUT */}
      {/* =================================================================== */}
      {isEditModalOpen && editingLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-[var(--font-vollkorn)] text-2xl font-bold text-primary">
                  Edit Layout
                </h2>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  {editingLayout.id}
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
                  Layout Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editingLayout.name}
                  onChange={(e) => setEditingLayout({ ...editingLayout, name: e.target.value })}
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
                    value={editingLayout.photo_count}
                    onChange={(e) =>
                      setEditingLayout({
                        ...editingLayout,
                        photo_count: parseInt(e.target.value, 10) || 1,
                      })
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
                    value={editingLayout.aspect_ratio}
                    onChange={(e) =>
                      setEditingLayout({ ...editingLayout, aspect_ratio: e.target.value })
                    }
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
                    value={editingLayout.canvas_width}
                    onChange={(e) =>
                      setEditingLayout({
                        ...editingLayout,
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
                    value={editingLayout.canvas_height}
                    onChange={(e) =>
                      setEditingLayout({
                        ...editingLayout,
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
                  id="edit_is_active"
                  checked={editingLayout.is_active}
                  onChange={(e) =>
                    setEditingLayout({ ...editingLayout, is_active: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="edit_is_active" className="text-xs font-bold text-on-surface">
                  Layout Active (Visible in studio photobooth)
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
      {isDeleteModalOpen && deletingLayout && (
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
