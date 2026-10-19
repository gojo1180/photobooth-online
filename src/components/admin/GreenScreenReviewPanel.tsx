'use client';

import { useState } from 'react';
import { type GreenScreenDetectionResult } from '@/lib/greenScreenDetector';
import { type BackendLayout } from '@/lib/api';
import { calculateAspectRatioString } from '@/app/admin/layouts/types';
import { Save, Sparkles, Layers, Eye, Image as ImageIcon } from 'lucide-react';

interface GreenScreenReviewPanelProps {
  detection: GreenScreenDetectionResult;
  originalImageSrc: string | null;
  currentLayout?: BackendLayout;
  isSaving: boolean;
  onSave: () => void;
}

export function GreenScreenReviewPanel({
  detection,
  originalImageSrc,
  currentLayout,
  isSaving,
  onSave,
}: GreenScreenReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'detected' | 'simulated' | 'punched'>('detected');

  const canvasWidth = detection.originalWidth;
  const canvasHeight = detection.originalHeight;
  const aspectRatio = calculateAspectRatioString(canvasWidth, canvasHeight);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-xs p-6 mb-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-green-700" />
            <span>{detection.detectedCount} Slot Foto Berhasil Dideteksi Otomatis!</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Resolusi kanvas: <strong className="text-on-surface">{canvasWidth} × {canvasHeight} px</strong> (Rasio {aspectRatio})
          </p>
        </div>

        {/* Review Tabs */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('detected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'detected'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Review Slot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulated'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Simulasi Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('punched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'punched'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Punched PNG</span>
          </button>
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Canvas Display */}
        <div className="md:col-span-7 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <div className="relative max-w-[320px] w-full flex items-center justify-center">
            {activeTab === 'detected' && (
              <div className="relative inline-block bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] rounded-lg p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detection.punchedDataUrl}
                  alt="Detected Slots"
                  className="w-full max-h-[500px] object-contain drop-shadow-md rounded-lg"
                />
                {/* Bounding box highlight badges */}
                {detection.slots.map((slot, i) => {
                  const leftPct = (slot.x / canvasWidth) * 100;
                  const topPct = (slot.y / canvasHeight) * 100;
                  const widthPct = (slot.width / canvasWidth) * 100;
                  const heightPct = (slot.height / canvasHeight) * 100;

                  return (
                    <div
                      key={i}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      className="absolute border-2 border-primary bg-primary/20 rounded pointer-events-none flex items-center justify-center"
                    >
                      <span className="bg-primary text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        Pose #{i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'simulated' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detection.simulatedPreviewUrl}
                alt="Simulated Result Preview"
                className="w-full max-h-[500px] object-contain drop-shadow-md rounded-lg"
              />
            )}

            {activeTab === 'punched' && (
              <div className="p-3 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detection.punchedDataUrl}
                  alt="Punched Transparent Result"
                  className="w-full max-h-[480px] object-contain"
                />
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono text-on-surface-variant mt-3 text-center">
            {activeTab === 'detected' && 'Kotak biru menandai slot foto yang terdeteksi otomatis'}
            {activeTab === 'simulated' && 'Simulasi foto candid: stiker & border menimpa foto secara alami'}
            {activeTab === 'punched' && 'Area hijau telah dihapus menjadi transparan sempurna'}
          </span>
        </div>

        {/* Detected Slots Info Sidebar */}
        <div className="md:col-span-5 flex flex-col justify-between h-full">
          <div>
            <h4 className="font-serif text-lg font-bold text-primary mb-3">
              Koordinat Slot Terdeteksi
            </h4>
            <div className="flex flex-col gap-2.5">
              {detection.slots.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-mono text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">
                        Pose #{idx + 1}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        Dimensi: {s.width} × {s.height} px
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-secondary font-bold">
                    (x:{s.x}, y:{s.y})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan Template...' : 'Simpan Frame Template'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
