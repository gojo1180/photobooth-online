'use client';

import { useState } from 'react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { RetakeModal } from '@/components/photobooth/RetakeModal';
import { Footer } from '@/components/common/Footer';
import { CanvasStage } from '@/components/photobooth/CanvasStage';
import { FILTER_OPTIONS, FRAME_OPTIONS } from './editor/types';
import { EditorPrintMockup } from './editor/EditorPrintMockup';
import { EditorCustomizePanels } from './editor/EditorCustomizePanels';

export function StudioEditor() {
  const {
    capturedPhotos,
    selectedLayoutId,
    expectedPhotoCount,
    setStep,
    selectedFrame,
    activeFilter,
    setActiveFilter,
    frameThemeKey,
    setFrameThemeKey,
    cardCaption,
    setCardCaption,
    showDateStamp,
    setShowDateStamp,
    dateStampText,
    setDateStampText,
  } = usePhotoboothStore();

  const [activeFilterKey, setActiveFilterKey] = useState<string>(activeFilter || 'natural');
  const [previewMode, setPreviewMode] = useState<'sheet' | 'canvas'>('canvas');
  const [retakePoseIndex, setRetakePoseIndex] = useState<number | null>(null);

  const totalSlots = expectedPhotoCount || 4;
  const currentFilter = FILTER_OPTIONS.find((f) => f.key === activeFilterKey) || FILTER_OPTIONS[0];
  const currentFrame = FRAME_OPTIONS.find((fr) => fr.key === frameThemeKey) || FRAME_OPTIONS[0];

  const handleSelectFilter = (key: string) => {
    setActiveFilterKey(key);
    setActiveFilter(key);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-on-surface">
      {/* TOP DECORATIVE HERO ARC */}
      <section className="w-full bg-secondary-container text-on-secondary relative pt-8 sm:pt-12 pb-28 sm:pb-32 md:pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-margin relative z-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-1 rounded-full shadow-xs border border-outline-variant/30 mb-space-sm font-bold">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_fix_high</span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
              STEP 03 / 04 • STUDIO FINAL TOUCH
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-primary leading-tight max-w-2xl drop-shadow-sm uppercase font-serif">
            Curate Filters &amp; Frame Design
          </h1>
          <p className="font-body-md text-body-md text-on-secondary-container mt-2 max-w-xl">
            Fine-tune vintage color grades, select your signature scrapbook border, and add an archival date stamp.
          </p>
        </div>

        {/* Scallop Wave Divider Downward */}
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

      {/* MAIN STUDIO WORKSPACE */}
      <section className="max-w-7xl mx-auto px-margin py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT COLUMN: Print Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                  {totalSlots} Poses • {selectedLayoutId?.replace('layout_', '').toUpperCase() || 'GRID'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setPreviewMode('sheet')}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    previewMode === 'sheet'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Quick Mockup
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('canvas')}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                    previewMode === 'canvas'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Final Export
                </button>
              </div>
            </div>

            {previewMode === 'canvas' ? (
              <div className="w-full flex justify-center">
                <CanvasStage
                  frame={selectedFrame}
                  photos={capturedPhotos}
                  filterKey={activeFilter}
                />
              </div>
            ) : (
              <EditorPrintMockup
                totalSlots={totalSlots}
                selectedLayoutId={selectedLayoutId}
                currentFrame={currentFrame}
                currentFilter={currentFilter}
                capturedPhotos={capturedPhotos}
                cardCaption={cardCaption}
                showDateStamp={showDateStamp}
                dateStampText={dateStampText}
                onRetakePose={(idx) => setRetakePoseIndex(idx)}
              />
            )}

            <div className="mt-space-md text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                Active Filter: {currentFilter.name} • Frame: {selectedFrame?.name || currentFrame.name}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Controls */}
          <div className="lg:col-span-7">
            <EditorCustomizePanels
              activeFilterKey={activeFilterKey}
              onSelectFilter={handleSelectFilter}
              selectedFrame={selectedFrame}
              currentFrame={currentFrame}
              selectedLayoutId={selectedLayoutId}
              frameThemeKey={frameThemeKey}
              setFrameThemeKey={setFrameThemeKey}
              totalSlots={totalSlots}
              onRetakePose={(idx) => setRetakePoseIndex(idx)}
              cardCaption={cardCaption}
              setCardCaption={setCardCaption}
              showDateStamp={showDateStamp}
              setShowDateStamp={setShowDateStamp}
              dateStampText={dateStampText}
              setDateStampText={setDateStampText}
              onBackToCamera={() => setStep('CAPTURE')}
              onProceedToExport={() => selectedFrame && setStep('EXPORT')}
            />
          </div>
        </div>
      </section>

      {/* Studio Editorial Quote */}
      <section className="w-full bg-background pt-space-lg pb-space-xl relative">
        <div className="max-w-3xl mx-auto px-margin text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary mb-space-sm shadow-xs">
            <span className="material-symbols-outlined text-[28px]">format_quote</span>
          </div>
          <blockquote className="font-body-lg text-body-lg italic text-primary leading-relaxed font-serif">
            &ldquo;NevStudio transformed our spontaneous laughs into an editorial keepsake that feels warm and timeless. Every detail is full of personality.&rdquo;
          </blockquote>
          <p className="font-label-md text-label-md uppercase tracking-wider text-secondary mt-space-sm font-bold">
            NADIA &amp; RENO • STUDIO ARCHIVE VOL. 14
          </p>
        </div>
      </section>

      {/* Retake Modal */}
      {retakePoseIndex !== null && (
        <RetakeModal
          poseIndex={retakePoseIndex}
          isOpen={true}
          onClose={() => setRetakePoseIndex(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
