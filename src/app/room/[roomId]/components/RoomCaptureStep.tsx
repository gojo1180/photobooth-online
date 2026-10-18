'use client';

import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { DualCameraGrid, type DualCameraGridRef } from '@/components/photobooth/DualCameraGrid';
import { CountdownOverlay } from '@/components/common/CountdownOverlay';
import { ScreenFlash } from '@/components/common/ScreenFlash';
import type { UserRole } from '@/stores/useRoomStore';
import { Camera, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';

interface RoomCaptureStepProps {
  role: UserRole | null;
  capturedPhotos: string[];
  expectedPhotoCount: number;
  isCompanionConnected: boolean;
  connectionError: string | null;
  retryConnection: () => void;
  dualGridRef: React.RefObject<DualCameraGridRef | null>;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  countdownSeconds: number;
  isCountdownActive: boolean;
  isCameraReady: boolean;
  hasCompleteCapture: boolean;
  showFlash: boolean;
  triggerSynchronizedShutter: () => void;
  onBackToWaiting: () => void;
  onProceedToCustomize: () => void;
}

export function RoomCaptureStep({
  role,
  capturedPhotos,
  expectedPhotoCount,
  isCompanionConnected,
  connectionError,
  retryConnection,
  dualGridRef,
  localStream,
  remoteStream,
  countdownSeconds,
  isCountdownActive,
  isCameraReady,
  hasCompleteCapture,
  showFlash,
  triggerSynchronizedShutter,
  onBackToWaiting,
  onProceedToCustomize,
}: RoomCaptureStepProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />
      <ScreenFlash isActive={showFlash} />

      <main className="w-full pt-16 md:pt-20 bg-background">
        {/* Top Hero Banner */}
        <section className="relative w-full bg-primary text-on-primary pt-8 sm:pt-10 pb-24 sm:pb-28 overflow-hidden">
          <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-xs border border-white/20 mb-2 font-bold text-[10px] font-mono uppercase tracking-widest text-primary">
              <Camera className="w-3.5 h-3.5" />
              <span>STEP 02 / 04 • SYNCHRONIZED CAPTURE</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg font-serif uppercase tracking-tight text-white">
              PHOTO SESSION ({capturedPhotos.length}/{expectedPhotoCount})
            </h1>
            <p className="text-xs sm:text-sm text-on-primary-container max-w-md mt-1">
              Strike your poses together in front of both lenses. Snaps are captured side-by-side in real-time.
            </p>

            {/* Stepper Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => role === 'host' && onBackToWaiting()}
                className="bg-surface-container-low/30 hover:bg-surface-container-low/50 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                1. WAITING &amp; FORMAT
              </button>
              <span className="material-symbols-outlined text-[14px] text-white/50">arrow_forward</span>
              <span className="bg-secondary-container text-on-secondary-fixed font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                2. SESI FOTO
              </span>
              <span className="material-symbols-outlined text-[14px] text-white/50">arrow_forward</span>
              <span className="bg-surface-container-low/30 text-white/70 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                3. EDIT BINGKAI
              </span>
              <span className="material-symbols-outlined text-[14px] text-white/50">arrow_forward</span>
              <span className="bg-surface-container-low/30 text-white/70 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
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

        {/* Capture Workspace */}
        <section className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col items-center gap-6">
          {!isCompanionConnected && (
            <div className="w-full rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" role="alert">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">Sesi dijeda</p>
                  <p className="text-xs mt-0.5">Shutter dinonaktifkan sampai koneksi kedua kamera pulih.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={retryConnection}
                className="px-4 py-2 rounded-xl bg-amber-900 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sambungkan Ulang
              </button>
            </div>
          )}

          {/* Dual Camera Grid with Side-by-Side Views */}
          <DualCameraGrid
            ref={dualGridRef}
            localStream={localStream}
            remoteStream={remoteStream}
          />

          {/* Countdown Overlay */}
          <CountdownOverlay count={countdownSeconds} isActive={isCountdownActive} />

          {/* Shutter Trigger Control Bar */}
          <div className="w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-serif font-bold text-lg text-primary">
                Synchronized Shutter (Dual View)
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {role === 'host'
                  ? `Click shutter to capture pose ${capturedPhotos.length + 1} of ${expectedPhotoCount}.`
                  : `Waiting for host to trigger the shutter. Pose ${capturedPhotos.length} of ${expectedPhotoCount} completed.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={
                  role !== 'host' ||
                  !isCameraReady ||
                  !isCompanionConnected ||
                  isCountdownActive ||
                  hasCompleteCapture
                }
                onClick={triggerSynchronizedShutter}
                className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {role !== 'host'
                    ? 'HOST CONTROLS SHUTTER'
                    : isCountdownActive
                      ? 'COUNTING…'
                      : 'SYNC SNAP!'}
                </span>
              </button>

              {role === 'host' && hasCompleteCapture && (
                <button
                  type="button"
                  onClick={onProceedToCustomize}
                  className="px-6 py-3.5 rounded-2xl bg-secondary-container text-on-secondary-fixed text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-secondary active:scale-95 transition-all"
                >
                  <span>Proceed to Frames</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Captured Photos Strip Preview */}
          {capturedPhotos.length > 0 && (
            <div className="w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-3 px-1">
                Captured Snapshots ({capturedPhotos.length}/{expectedPhotoCount})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {capturedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xs bg-black"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Pose ${index + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Pose {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
