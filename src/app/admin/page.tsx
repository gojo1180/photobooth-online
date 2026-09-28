'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAdminLayouts,
  getLayouts,
  getAdminFrames,
  getFrames,
  updateAdminLayout,
  updateAdminFrame,
  normalizeAssetUrl,
  API_BASE_URL,
  type BackendLayout,
  type BackendFrame,
} from '@/lib/api';
import {
  LayoutGrid,
  Image as ImageIcon,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [layouts, setLayouts] = useState<BackendLayout[]>([]);
  const [frames, setFrames] = useState<BackendFrame[]>([]);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    // 1. Health check
    try {
      const healthUrl = API_BASE_URL.replace('/api/v1', '/health');
      const res = await fetch(healthUrl);
      setIsBackendHealthy(res.ok);
    } catch {
      setIsBackendHealthy(false);
    }

    // 2. Layouts
    let fetchedLayouts: BackendLayout[] = [];
    try {
      fetchedLayouts = await getAdminLayouts();
    } catch {
      fetchedLayouts = await getLayouts().catch(() => []);
    }
    setLayouts(fetchedLayouts);

    // 3. Frames
    let fetchedFrames: BackendFrame[] = [];
    try {
      fetchedFrames = await getAdminFrames();
    } catch {
      if (fetchedLayouts.length > 0) {
        const promises = fetchedLayouts.map((l) => getFrames(l.id).catch(() => []));
        const res = await Promise.all(promises);
        fetchedFrames = res.flat();
      }
    }
    setFrames(fetchedFrames);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleLayout = async (layout: BackendLayout) => {
    const newStatus = !layout.is_active;
    try {
      await updateAdminLayout(layout.id, { is_active: newStatus });
      setLayouts((prev) =>
        prev.map((l) => (l.id === layout.id ? { ...l, is_active: newStatus } : l))
      );
    } catch (err) {
      console.error('Failed to toggle layout status:', err);
    }
  };

  const handleToggleFrame = async (frame: BackendFrame) => {
    const newStatus = !frame.is_active;
    try {
      await updateAdminFrame(frame.id, { is_active: newStatus });
      setFrames((prev) =>
        prev.map((f) => (f.id === frame.id ? { ...f, is_active: newStatus } : f))
      );
    } catch (err) {
      console.error('Failed to toggle frame status:', err);
    }
  };

  const activeLayoutsCount = layouts.filter((l) => l.is_active).length;
  const activeFramesCount = frames.filter((f) => f.is_active).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed border border-secondary/20 shadow-xs font-mono">
            COMMAND CENTER
          </span>
          <h1 className="font-[var(--font-vollkorn)] text-3xl md:text-4xl font-bold text-primary mt-2">
            Studio Admin Dashboard
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time management for layouts, frames, visual templates, and system health.
          </p>
        </div>

        {/* Live Backend Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-bold">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isBackendHealthy === true
                ? 'bg-emerald-500 animate-pulse'
                : isBackendHealthy === false
                ? 'bg-rose-500'
                : 'bg-amber-500 animate-ping'
            }`}
          />
          <span className="text-on-surface">
            {isBackendHealthy === true
              ? 'Go Backend Live'
              : isBackendHealthy === false
              ? 'Backend Offline'
              : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/admin/layouts"
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs hover:border-primary/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Grid Layouts
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-[var(--font-vollkorn)] text-4xl font-bold text-primary">
              {layouts.length}
            </p>
            <span className="text-xs text-emerald-600 font-bold">
              ({activeLayoutsCount} active)
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1 group-hover:text-primary transition-colors">
            Manage &amp; configure formats <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/admin/frames"
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs hover:border-secondary/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Frame Overlays
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-[var(--font-vollkorn)] text-4xl font-bold text-primary">
              {frames.length}
            </p>
            <span className="text-xs text-emerald-600 font-bold">
              ({activeFramesCount} active)
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1 group-hover:text-primary transition-colors">
            Browse &amp; edit templates <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">
              Privacy Architecture
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-[var(--font-vollkorn)] text-3xl font-bold text-emerald-700">
            100% In RAM
          </p>
          <span className="text-[11px] text-on-surface-variant mt-2 block">
            Zero-server visual storage invariant
          </span>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-[var(--font-vollkorn)] text-xl font-bold text-primary">
            Upload &amp; Map New Frame Template
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Upload transparent PNG frame assets and define photo slot bounding boxes with live visual feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/layouts"
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs font-bold uppercase tracking-wider text-on-surface transition-all active:scale-[0.98]"
          >
            Manage Layouts
          </Link>
          <Link
            href="/admin/frames/new"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Slot Mapper</span>
          </Link>
        </div>
      </div>

      {/* Quick Management Tables: Layouts & Frames */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layouts Quick Manager */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <h3 className="font-[var(--font-vollkorn)] text-lg font-bold text-primary">
                Layout Formats ({layouts.length})
              </h3>
            </div>
            <Link
              href="/admin/layouts"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Full CRUD <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {layouts.slice(0, 4).map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-on-surface">{l.name}</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-surface-container text-on-surface-variant">
                      {l.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {l.photo_count} poses • {l.canvas_width}×{l.canvas_height}px • {l.aspect_ratio}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleLayout(l)}
                  className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
                  title="Toggle Active Status"
                >
                  {l.is_active ? (
                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>{l.is_active ? 'Live' : 'Off'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Frames Quick Manager */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-secondary" />
              <h3 className="font-[var(--font-vollkorn)] text-lg font-bold text-primary">
                Frame Templates ({frames.length})
              </h3>
            </div>
            <Link
              href="/admin/frames"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Full Gallery <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {frames.slice(0, 4).map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                    <img src={normalizeAssetUrl(f.asset_url)} alt={f.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface truncate block max-w-[180px]">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {f.layout_id} • {f.slots.length} slots
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFrame(f)}
                  className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
                  title="Toggle Active Status"
                >
                  {f.is_active ? (
                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>{f.is_active ? 'Live' : 'Off'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
