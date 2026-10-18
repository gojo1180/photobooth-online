'use client';

import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CanvasStage, type CanvasStageRef } from '@/components/photobooth/CanvasStage';
import { FramePicker } from '@/components/photobooth/FramePicker';
import { FilterBar } from '@/components/photobooth/FilterBar';
import type { UserRole } from '@/stores/useRoomStore';
import type { FrameItem } from '@/stores/usePhotoboothStore';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface RoomCustomizeStepProps {
  role: UserRole | null;
  stageRef: React.RefObject<CanvasStageRef | null>;
  selectedFrame: FrameItem | null;
  capturedPhotos: string[];
  activeFilter: string;
  onBackToWaiting: () => void;
  onBackToCapture: () => void;
  onProceedToExport: () => void;
}

export function RoomCustomizeStep({
  role,
  stageRef,
  selectedFrame,
  capturedPhotos,
  activeFilter,
  onBackToWaiting,
  onBackToCapture,
  onProceedToExport,
}: RoomCustomizeStepProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="w-full pt-16 md:pt-20 bg-background">
        {/* Top Hero Banner */}
        <section className="relative w-full bg-secondary-container text-on-secondary pt-8 sm:pt-10 pb-24 sm:pb-28 overflow-hidden">
          <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-xs border border-outline-variant/20 mb-2 font-bold text-[10px] font-mono uppercase tracking-widest text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP 03 / 04 • FRAME EDITOR &amp; REVIEW</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg font-serif uppercase tracking-tight text-on-secondary-container">
              Customize Frame &amp; Filters
            </h1>
            <p className="text-xs sm:text-sm text-on-secondary-container/90 max-w-md mt-1">
              Select your favorite frame template, apply retro vintage filters, and review your final layout.
            </p>

            {/* Stepper Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => role === 'host' && onBackToWaiting()}
                className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-80 cursor-pointer"
              >
                1. WAITING &amp; FORMAT
              </button>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <button
                type="button"
                onClick={() => role === 'host' && onBackToCapture()}
                className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-80 cursor-pointer"
              >
                2. SESI FOTO
              </button>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-primary text-on-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                3. EDIT BINGKAI
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-80">
                4. PRINT &amp; EXPORT
              </span>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
            <svg className="w-full h-12 sm:h-16 block fill-background" preserveAspectRatio="none" viewBox="0 0 1440 320">
              <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        {/* Editor Workspace */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Composite Canvas Stage */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <CanvasStage
                ref={stageRef}
                frame={selectedFrame}
                photos={capturedPhotos}
                filterKey={activeFilter}
              />
            </div>

            {/* Right: Frame Picker & Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs">
                <FramePicker readOnly={role !== 'host'} />
                <div className="mt-6 pt-6 border-t border-outline-variant/30">
                  <FilterBar readOnly={role !== 'host'} />
                </div>
              </div>

              {role === 'host' ? (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={!selectedFrame}
                    onClick={onProceedToExport}
                    className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-container text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    <span>{selectedFrame ? 'Proceed to Print & Export' : 'Select a Frame to Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onBackToCapture}
                    className="w-full py-3.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span>Retake Snapshots</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-center">
                  <p className="text-xs font-bold text-primary">Host sedang menyusun hasil akhir</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Pilihan frame dan filter akan diperbarui otomatis.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
