'use client';

import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CanvasStage, type CanvasStageRef } from '@/components/photobooth/CanvasStage';
import { PolaroidEjectionStage } from '@/components/photobooth/PolaroidEjectionStage';
import { ExportActions } from '@/components/photobooth/ExportActions';
import type { UserRole } from '@/stores/useRoomStore';
import type { FrameItem } from '@/stores/usePhotoboothStore';
import { Sparkles, RotateCcw, Users } from 'lucide-react';

interface RoomExportStepProps {
  role: UserRole | null;
  stageRef: React.RefObject<CanvasStageRef | null>;
  selectedFrame: FrameItem | null;
  capturedPhotos: string[];
  activeFilter: string;
  onExportPng: () => string | null;
  onBackToCustomize: () => void;
  onReturnToWaiting: () => void;
}

export function RoomExportStep({
  role,
  stageRef,
  selectedFrame,
  capturedPhotos,
  activeFilter,
  onExportPng,
  onBackToCustomize,
  onReturnToWaiting,
}: RoomExportStepProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="w-full pt-16 md:pt-20 bg-background">
        {/* Top Hero Banner */}
        <section className="relative w-full bg-secondary-container text-on-secondary pt-8 sm:pt-10 pb-24 sm:pb-28 overflow-hidden">
          <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-xs border border-outline-variant/20 mb-2 font-bold text-[10px] font-mono uppercase tracking-widest text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP 04 / 04 • PRINT &amp; DOWNLOAD</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg font-serif uppercase tracking-tight text-on-secondary-container">
              Your Duo Keepsake is Ready
            </h1>
            <p className="text-xs sm:text-sm text-on-secondary-container/90 max-w-md mt-1">
              Download your high-resolution browser render or print it directly.
            </p>

            {/* Stepper Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-70">
                1. WAITING &amp; FORMAT
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-70">
                2. SESI FOTO
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full opacity-70">
                3. EDIT BINGKAI
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-primary text-on-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
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

        {/* Export Workspace */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Composite Canvas Stage with Polaroid Ejection */}
            <div className="print-output lg:col-span-7 flex flex-col items-center w-full">
              <PolaroidEjectionStage>
                <CanvasStage
                  ref={stageRef}
                  frame={selectedFrame}
                  photos={capturedPhotos}
                  filterKey={activeFilter}
                />
              </PolaroidEjectionStage>
            </div>

            {/* Right: Export Actions */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <ExportActions onExportPng={onExportPng} />

              {role === 'host' ? (
                <>
                  <button
                    type="button"
                    onClick={onBackToCustomize}
                    className="w-full py-3.5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span>Back to Frame Editor</span>
                  </button>

                  <button
                    type="button"
                    onClick={onReturnToWaiting}
                    className="w-full py-3.5 rounded-2xl bg-secondary-container text-on-secondary-fixed hover:bg-secondary text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span>Return to Waiting Room</span>
                  </button>
                </>
              ) : (
                <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-center">
                  <p className="text-xs font-bold text-primary">Unduh salinan Anda kapan saja</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Host akan mengontrol perpindahan kembali ke editor atau waiting room.</p>
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
