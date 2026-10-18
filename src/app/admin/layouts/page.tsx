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
  CheckCircle2,
  AlertCircle,
  Search,
  LayoutGrid,
} from 'lucide-react';

import { type LayoutItem, FALLBACK_LAYOUTS } from './types';
import { LayoutCard } from './components/LayoutCard';
import { CreateLayoutModal, type CreateLayoutParams } from './components/CreateLayoutModal';
import { EditLayoutModal } from './components/EditLayoutModal';
import { DeleteLayoutModal } from './components/DeleteLayoutModal';

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState<LayoutItem[]>(FALLBACK_LAYOUTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State: Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLayoutParams>({
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
      let data: BackendLayout[] = [];
      try {
        data = await getAdminLayouts();
      } catch {
        data = await getLayouts();
      }

      if (data && data.length > 0) {
        setLayouts(data);
      } else {
        setLayouts(FALLBACK_LAYOUTS);
      }
    } catch {
      showToast('error', 'Failed to load layouts. Showing offline presets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayouts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAdminLayout({
        id: createForm.id.trim().toLowerCase(),
        name: createForm.name.trim(),
        photo_count: Number(createForm.photo_count),
        canvas_width: Number(createForm.canvas_width),
        canvas_height: Number(createForm.canvas_height),
        aspect_ratio: createForm.aspect_ratio.trim(),
        is_active: Boolean(createForm.is_active),
      });

      showToast('success', `Layout "${createForm.name}" created successfully!`);
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
      loadLayouts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create layout';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
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
        is_active: Boolean(editingLayout.is_active),
      });

      showToast('success', `Layout "${editingLayout.name}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingLayout(null);
      loadLayouts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update layout';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLayout) return;
    setIsSubmitting(true);
    try {
      await deleteAdminLayout(deletingLayout.id);
      showToast('success', `Layout "${deletingLayout.name}" deleted.`);
      setIsDeleteModalOpen(false);
      setDeletingLayout(null);
      loadLayouts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete layout';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (layout: LayoutItem) => {
    const updatedStatus = !layout.is_active;
    try {
      await updateAdminLayout(layout.id, { is_active: updatedStatus });
      setLayouts((prev) =>
        prev.map((l) => (l.id === layout.id ? { ...l, is_active: updatedStatus } : l))
      );
      showToast('success', `Layout "${layout.name}" is now ${updatedStatus ? 'Active' : 'Disabled'}.`);
    } catch {
      showToast('error', 'Failed to update layout status.');
    }
  };

  const filteredLayouts = layouts.filter((layout) => {
    const matchesSearch =
      layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (layout.description && layout.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterActive === 'active') return matchesSearch && layout.is_active;
    if (filterActive === 'inactive') return matchesSearch && !layout.is_active;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-vollkorn)] text-2xl sm:text-3xl font-bold text-primary">
            Layout Formats
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage photobooth grid aspects, camera pose counts, and canvas dimensions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Layout Grid</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search layout by name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-surface-container-low border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(['all', 'active', 'inactive'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterActive(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterActive === mode
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 flex flex-col items-center justify-center text-on-surface-variant gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs font-bold">Loading layout templates...</span>
        </div>
      )}

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLayouts.map((layout) => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            onToggleStatus={handleToggleStatus}
            onEdit={(l) => {
              setEditingLayout(l);
              setIsEditModalOpen(true);
            }}
            onDelete={(l) => {
              setDeletingLayout(l);
              setIsDeleteModalOpen(true);
            }}
          />
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

      {/* Modals */}
      <CreateLayoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <EditLayoutModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLayout(null);
        }}
        editingLayout={editingLayout}
        setEditingLayout={setEditingLayout}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      <DeleteLayoutModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLayout(null);
        }}
        deletingLayout={deletingLayout}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
