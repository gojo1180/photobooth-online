'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminFrame,
  updateAdminLayout,
  getAdminLayouts,
  getLayouts,
  type BackendLayout,
} from '@/lib/api';
import {
  detectAndPunchGreenScreen,
  type GreenScreenDetectionResult,
} from '@/lib/greenScreenDetector';
import { calculateAspectRatioString } from '@/app/admin/layouts/types';
import { GreenScreenReviewPanel } from '@/components/admin/GreenScreenReviewPanel';
import { Upload, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewFramePage() {
  const router = useRouter();

  const [layouts, setLayouts] = useState<BackendLayout[]>([]);
  const [frameName, setFrameName] = useState('');
  const [layoutId, setLayoutId] = useState('layout_3_strip');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);

  // Green screen detection state
  const [isScanning, setIsScanning] = useState(false);
  const [detection, setDetection] = useState<GreenScreenDetectionResult | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg(null);
    setDetection(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setOriginalImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);

    // Run automated Green Screen Detection at exact frame template dimensions
    setIsScanning(true);
    try {
      const result = await detectAndPunchGreenScreen(file);
      setDetection(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memindai area Green Screen';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!frameName.trim()) {
      alert('Silakan isi nama template frame terlebih dahulu.');
      return;
    }

    if (!detection || detection.slots.length === 0) {
      alert('Silakan upload template frame dengan area Green Screen (#00FF00).');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      // Synchronize the parent layout's canvas dimensions and aspect ratio to match the uploaded frame template!
      const origW = detection.originalWidth;
      const origH = detection.originalHeight;
      const calculatedRatio = calculateAspectRatioString(origW, origH);

      try {
        await updateAdminLayout(layoutId, {
          canvas_width: origW,
          canvas_height: origH,
          aspect_ratio: calculatedRatio,
        });
      } catch (layoutErr) {
        console.warn('Could not auto-sync layout canvas dimensions:', layoutErr);
      }

      const formData = new FormData();
      formData.append('layout_id', layoutId);
      formData.append('name', frameName);
      formData.append('slots', JSON.stringify(detection.slots));

      // Upload the punched transparent PNG (where green color is removed)
      formData.append(
        'file',
        detection.punchedBlob,
        `${frameName.toLowerCase().replace(/\s+/g, '_')}.png`
      );

      await createAdminFrame(formData);

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/frames');
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan template frame.';
      setErrorMsg(message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentLayout = layouts.find((l) => l.id === layoutId);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/frames"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Frames
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
            Upload Frame Green Screen
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-mono text-[11px] font-bold uppercase tracking-wider">
            Auto-Detect
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Unggah file template PNG ber-green screen (<code className="text-primary font-bold">#00FF00</code>).
          Sistem akan memindai posisi slot foto secara otomatis dan melubangi area hijau menjadi transparan.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-800 text-sm font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Template frame berhasil diproses dan disimpan ke katalog studio!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Frame Form Setup */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs mb-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Nama Frame
          </label>
          <input
            type="text"
            required
            value={frameName}
            onChange={(e) => setFrameName(e.target.value)}
            placeholder="Contoh: Airmail Vintage 3-Strip"
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-medium bg-surface-container-low text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Format Layout
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
            File PNG Frame Green Screen
          </label>
          <label className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] transition-all">
            <Upload className="w-4 h-4 text-primary" />
            <span>{selectedFile ? selectedFile.name : 'Pilih File PNG'}</span>
            <input
              type="file"
              accept="image/png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Scanning Indicator */}
      {isScanning && (
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-xs flex flex-col items-center justify-center text-center mb-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <span className="font-bold text-sm text-primary">Memindai Area Green Screen...</span>
          <span className="text-xs text-on-surface-variant mt-1">
            Mendeteksi koordinat pulau hijau dan melubangi frame secara otomatis...
          </span>
        </div>
      )}

      {/* Visual Review Panel */}
      {detection && !isScanning && (
        <GreenScreenReviewPanel
          detection={detection}
          originalImageSrc={originalImageSrc}
          currentLayout={currentLayout}
          isSaving={isSaving}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
