'use client';

import { useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { playBeep, playShutter } from '@/lib/audio';

interface RetakeModalProps {
  poseIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RetakeModal({ poseIndex, isOpen, onClose }: RetakeModalProps) {
  const { replacePhotoAtIndex } = usePhotoboothStore();
  const { videoRef, isReady, isMirrored, captureSnapshot } = useCamera();

  const [isCounting, setIsCounting] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);

  if (!isOpen) return null;

  const handleRetakeSnap = () => {
    if (isCounting || !isReady) return;

    let sec = 3;
    setCountdownNum(sec);
    setIsCounting(true);
    playBeep(880, 0.12);

    const timer = setInterval(() => {
      sec -= 1;
      if (sec > 0) {
        setCountdownNum(sec);
        playBeep(880, 0.12);
      } else {
        clearInterval(timer);
        setIsCounting(false);
        playShutter();

        const snap = captureSnapshot();
        if (snap) {
          replacePhotoAtIndex(poseIndex, snap);
        }
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold text-xs">
              #
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary font-serif">
                Retake Pose #{poseIndex + 1}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Adjust your expression and click Retake to replace this shot.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant text-on-surface transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Webcam Viewfinder */}
        <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-xl overflow-hidden bg-black border border-outline-variant/30 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
          />

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Central Countdown */}
          {isCounting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-surface-container-lowest text-primary shadow-xl border border-outline-variant/30 flex flex-col items-center justify-center">
                <span className="font-headline-lg text-3xl font-bold leading-none">{countdownNum}</span>
                <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-secondary">POSE!</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md uppercase border border-outline-variant/30 shadow-xs cursor-pointer font-bold transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isCounting || !isReady}
            onClick={handleRetakeSnap}
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase shadow-sm flex items-center gap-2 cursor-pointer font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">camera</span>
            <span>{isCounting ? 'Capturing...' : 'Retake Shot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
