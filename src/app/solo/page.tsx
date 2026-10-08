'use client';

import { useEffect, useRef } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { LayoutSelector } from '@/components/photobooth/LayoutSelector';
import { CaptureSession } from '@/components/photobooth/CaptureSession';
import { StudioEditor } from '@/components/photobooth/StudioEditor';
import { CanvasStage, type CanvasStageRef } from '@/components/photobooth/CanvasStage';
import { ExportActions } from '@/components/photobooth/ExportActions';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';

export default function SoloPage() {
  const {
    step,
    setStep,
    selectedFrame,
    capturedPhotos,
    activeFilter,
    selectedLayoutId,
    expectedPhotoCount,
  } = usePhotoboothStore();

  const stageRef = useRef<CanvasStageRef | null>(null);
  const hasLayout = Boolean(selectedLayoutId && expectedPhotoCount > 0);
  const hasCompleteCapture = hasLayout && capturedPhotos.length >= expectedPhotoCount;

  let safeStep = step;
  if (step !== 'SELECT_LAYOUT' && !hasLayout) safeStep = 'SELECT_LAYOUT';
  if ((step === 'CUSTOMIZE' || step === 'EXPORT') && !hasCompleteCapture) safeStep = 'CAPTURE';
  if (step === 'EXPORT' && !selectedFrame) safeStep = 'CUSTOMIZE';

  useEffect(() => {
    if (safeStep !== step) setStep(safeStep);
  }, [safeStep, setStep, step]);

  const handleExportPng = () => {
    if (stageRef.current) {
      return stageRef.current.exportHighResPng();
    }
    return null;
  };

  // 1. STEP 1: PILIH FORMAT (Matching 2_step1_pilih_grid_layout.html)
  if (safeStep === 'SELECT_LAYOUT') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="w-full pt-16 md:pt-20 bg-background">
          <LayoutSelector />
        </main>
      </div>
    );
  }

  // 2. STEP 2: SESI FOTO (Matching 3_step2_sesi_pengambilan_foto.html)
  if (safeStep === 'CAPTURE') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="w-full pt-16 md:pt-20 bg-background">
          <CaptureSession />
        </main>
      </div>
    );
  }

  // 3. STEP 3: EDIT BINGKAI (Matching 4_step3_studio_review_and_frame_editor.html)
  if (safeStep === 'CUSTOMIZE') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="w-full pt-16 md:pt-20 bg-background">
          <StudioEditor />
        </main>
      </div>
    );
  }

  // 4. STEP 4: UNDUH & CETAK / EXPORT
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="w-full pt-16 md:pt-20 bg-background">
        {/* Top Hero Banner */}
        <section className="w-full bg-secondary-container text-on-secondary relative pt-8 sm:pt-12 pb-28 sm:pb-32 md:pb-36 overflow-hidden">
          <div className="max-w-7xl mx-auto px-margin relative z-20 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-1 rounded-full shadow-xs border border-outline-variant/20 mb-space-sm font-bold">
              <span className="material-symbols-outlined text-primary text-[18px]">print</span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">
                STEP 04 / 04 • PRINT &amp; DOWNLOAD
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-primary leading-tight max-w-2xl uppercase font-serif">
              Your Keepsake Print is Ready
            </h1>
            <p className="font-body-md text-body-md text-on-secondary-container mt-2 max-w-xl">
              Download high-resolution prints, compile animated GIFs, or print directly from your browser.
            </p>
          </div>

          {/* Wave divider */}
          <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
            <svg
              className="w-full h-14 sm:h-18 md:h-24 block fill-background"
              preserveAspectRatio="none"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        {/* Content Workspace */}
        <section className="max-w-7xl mx-auto px-margin py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* Left: Composite Canvas Stage Preview */}
            <div className="print-output lg:col-span-7 flex flex-col items-center">
              <CanvasStage
                ref={stageRef}
                frame={selectedFrame}
                photos={capturedPhotos}
                filterKey={activeFilter}
              />
            </div>

            {/* Right: Export Actions */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <ExportActions onExportPng={handleExportPng} />

              <button
                type="button"
                onClick={() => setStep('CUSTOMIZE')}
                className="py-3 px-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md uppercase shadow-xs flex items-center justify-center gap-2 transition-all font-bold cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Frame Editor</span>
              </button>
            </div>
          </div>
        </section>

        {/* Unified Footer */}
        <Footer />
      </main>
    </div>
  );
}
