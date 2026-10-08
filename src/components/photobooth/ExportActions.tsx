'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { useRoomStore } from '@/stores/useRoomStore';
import { useGifCompiler } from '@/hooks/useGifCompiler';
import { stopAllMediaStreams } from '@/hooks/useCamera';
import { PHOTO_FILTERS } from '@/lib/konva-helpers';
import { Download, Film, Printer, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

interface ExportActionsProps {
  onExportPng: () => string | null;
}

export function ExportActions({ onExportPng }: ExportActionsProps) {
  const router = useRouter();
  const { capturedPhotos, activeFilter, resetSession } = usePhotoboothStore();
  const { compileGif, isCompiling, progress, error: gifError } = useGifCompiler();

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // 1. Download Composite HD PNG
  const handleDownloadPng = () => {
    setExportError(null);
    const dataUrl = onExportPng();
    if (!dataUrl) {
      setExportError('Your final print is still rendering. Please wait a moment and try again.');
      return;
    }

    const link = document.createElement('a');
    link.download = `photobooth_y2k_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // 2. Compile & Download Animated GIF
  const handleCompileGif = async () => {
    if (capturedPhotos.length === 0) return;

    const url = await compileGif(capturedPhotos, {
      delay: 600,
      cssFilter: (PHOTO_FILTERS[activeFilter] || PHOTO_FILTERS.natural).cssFilter,
    });
    if (url) {
      const link = document.createElement('a');
      link.download = `photobooth_animated_${Date.now()}.gif`;
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  // 3. Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  // 4. Privacy & Memory Cleanup Protocol (PRD 5.4)
  const handleCleanupAndExit = () => {
    if (confirm('Finish this photobooth session and clear all photos from browser memory?')) {
      // 1. Turn off hardware camera indicators & stop tracks
      stopAllMediaStreams();
      // 2. Close WebRTC peer connection & reset room
      useRoomStore.getState().resetRoom();
      // 3. Release ephemeral bitmaps & reset Zustand store
      resetSession();
      // 4. Redirect to landing page
      router.push('/');
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
        <h3 className="font-headline-md text-headline-md text-primary font-serif">
          Save &amp; Download Keepsakes
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Download High-Res PNG */}
        <button
          type="button"
          onClick={handleDownloadPng}
          className="py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] font-bold"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
              <span>Saved to Device!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download HD PNG</span>
            </>
          )}
        </button>

        {/* Compile Animated GIF */}
        <button
          type="button"
          disabled={isCompiling}
          onClick={handleCompileGif}
          className="py-3.5 px-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim font-label-md text-label-md uppercase shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] font-bold disabled:opacity-60"
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Compiling GIF ({progress}%)</span>
            </>
          ) : (
            <>
              <Film className="w-4 h-4" />
              <span>Create Filtered Pose GIF</span>
            </>
          )}
        </button>

        {/* Direct Print */}
        <button
          type="button"
          onClick={handlePrint}
          className="py-3.5 px-4 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary-fixed font-label-md text-label-md uppercase shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] font-bold"
        >
          <Printer className="w-4 h-4" />
          <span>Print Photo Sheet</span>
        </button>

        {/* Privacy Memory Cleanup */}
        <button
          type="button"
          onClick={handleCleanupAndExit}
          className="py-3.5 px-4 rounded-xl border border-error/30 bg-surface-container-lowest hover:bg-error-container text-error font-label-md text-label-md uppercase shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] font-bold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Finish &amp; Clear Session</span>
        </button>
      </div>

      {/* Background GIF Compilation Progress Bar */}
      {isCompiling && (
        <div className="w-full bg-surface-container rounded-full h-3 border border-outline-variant overflow-hidden p-0.5 mb-3">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {exportError && (
        <p role="alert" className="mb-3 rounded-xl bg-error-container px-3 py-2 text-xs font-semibold text-on-error-container">
          {exportError}
        </p>
      )}

      {gifError && (
        <p role="alert" className="mb-3 rounded-xl bg-error-container px-3 py-2 text-xs font-semibold text-on-error-container">
          GIF export failed: {gifError}
        </p>
      )}

      {/* Zero Server Storage Badge */}
      <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs font-label-sm text-on-surface-variant font-medium">
        <span>✦ 100% Client-Side In-Memory Storage</span>
        <span className="font-bold text-primary">Zero Server Uploads</span>
      </div>
    </div>
  );
}
