'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SlotMapperCanvas } from '@/components/admin/SlotMapperCanvas';
import { type FrameSlot } from '@/stores/usePhotoboothStore';
import { createAdminFrame, getAdminLayouts, getLayouts, type BackendLayout } from '@/lib/api';
import { Upload, Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewFramePage() {
  const router = useRouter();

  const [layouts, setLayouts] = useState<BackendLayout[]>([]);
  const [frameName, setFrameName] = useState('');
  const [layoutId, setLayoutId] = useState('layout_3_strip');
  const [imageSrc, setImageSrc] = useState<string>('/frames/y2k_strip_pink.svg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [slots, setSlots] = useState<FrameSlot[]>([
    { index: 0, x: 40, y: 90, width: 400, height: 360 },
    { index: 1, x: 40, y: 480, width: 400, height: 360 },
    { index: 2, x: 40, y: 870, width: 400, height: 360 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadLayouts() {
      try {
        const data = await getAdminLayouts().catch(() => getLayouts());
        if (data && data.length > 0) {
          setLayouts(data);
        }
      } catch (err) {
        console.warn('Failed to load layouts:', err);
      }
    }
    loadLayouts();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!frameName.trim()) {
      alert('Please enter a frame name first.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('layout_id', layoutId);
      formData.append('name', frameName);
      formData.append('slots', JSON.stringify(slots));

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        // Fallback to fetch existing asset template as blob
        try {
          const res = await fetch(imageSrc);
          const blob = await res.blob();
          formData.append('file', blob, 'template.png');
        } catch {
          // If blob fetch fails, create an empty 1x1 png blob
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 1400;
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png')
          );
          if (blob) {
            formData.append('file', blob, 'template.png');
          }
        }
      }

      await createAdminFrame(formData);

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/frames');
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save frame template to studio catalog.';
      setErrorMsg(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/frames"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Frames
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
          New Frame &amp; Visual Slot Mapper
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Upload transparent PNG template, then visually drag or input photo bounding boxes.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-800 text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Frame successfully saved to studio catalog!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Frame Meta Form */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs mb-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Frame Title
          </label>
          <input
            type="text"
            required
            value={frameName}
            onChange={(e) => setFrameName(e.target.value)}
            placeholder="e.g. Y2K Ribbon Pastel Strip"
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-medium bg-surface-container-low text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Linked Layout Format
          </label>
          <select
            value={layoutId}
            onChange={(e) => setLayoutId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-medium bg-surface-container-low text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
          >
            {layouts.length > 0 ? (
              layouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.photo_count} Poses)
                </option>
              ))
            ) : (
              <>
                <option value="layout_3_strip">Classic 3-Strip (3 Poses)</option>
                <option value="layout_4_grid">Editorial 2x2 Grid (4 Poses)</option>
                <option value="layout_2_polaroid">Duo Polaroid (2 Poses)</option>
                <option value="layout_2_wide">2-Wide Strip (2 Poses)</option>
                <option value="layout_6_collage">Mini Collage (6 Poses)</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Upload Custom PNG Frame
          </label>
          <label className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] transition-all">
            <Upload className="w-4 h-4 text-primary" />
            <span>Choose File</span>
            <input
              type="file"
              accept="image/png,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Interactive Visual Slot Mapper */}
      {(() => {
        const currentLayout = layouts.find((l) => l.id === layoutId);
        const canvasWidth =
          currentLayout?.canvas_width ||
          (layoutId === 'layout_2_polaroid' ? 600 : layoutId === 'layout_4_grid' ? 1200 : 600);
        const canvasHeight =
          currentLayout?.canvas_height ||
          (layoutId === 'layout_2_polaroid' ? 900 : layoutId === 'layout_4_grid' ? 1200 : 1800);

        return (
          <div className="mb-8">
            <SlotMapperCanvas
              imageSrc={imageSrc}
              slots={slots}
              onSlotsChange={setSlots}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </div>
        );
      })()}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Template...' : 'Save Frame Template'}</span>
        </button>
      </div>
    </div>
  );
}
