'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface PolaroidEjectionStageProps {
  children: ReactNode;
}

export function PolaroidEjectionStage({ children }: PolaroidEjectionStageProps) {
  const [replayKey, setReplayKey] = useState(0);
  const [isEjecting, setIsEjecting] = useState(true);

  const handleReplay = () => {
    if (isEjecting) return;
    setIsEjecting(true);
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Camera / Printer Chassis Container */}
      <div className="relative w-full max-w-md sm:max-w-lg select-none print:hidden">
        {/* Layer 3 (z-30): Top Camera Housing & Slit Top Lip */}
        <div className="relative z-30 bg-[#16181f] text-zinc-100 rounded-t-2xl border border-zinc-700/80 border-b-0 shadow-lg px-4 pt-3 pb-2 transition-all">
          {/* Top Bar: Status LED, Retro Brand Stamp, Replay Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            {/* Status LED & Badge */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isEjecting && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-colors duration-300 ${
                    isEjecting
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  }`}
                />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-300">
                {isEjecting ? 'PRINTING KEEPSAKE...' : 'PRINT READY'}
              </span>
            </div>

            {/* Retro Brand Accent */}
            <div className="hidden sm:flex items-center gap-1.5 opacity-85">
              <div className="flex h-2.5 gap-0.5">
                <span className="w-1 rounded-xs bg-[#001C97]" />
                <span className="w-1 rounded-xs bg-[#E55B3C]" />
                <span className="w-1 rounded-xs bg-[#FFC837]" />
              </div>
              <span className="text-[10px] font-mono tracking-wider text-zinc-400 font-semibold uppercase">
                NEVSTUDIO P-01
              </span>
            </div>

            {/* Replay Print Animation Button */}
            <button
              type="button"
              onClick={handleReplay}
              disabled={isEjecting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 border border-zinc-600/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              title="Putar ulang animasi cetak polaroid"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isEjecting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cetak Ulang</span>
            </button>
          </div>

          {/* Physical Slit Top Overhang: Metal lip with depth shadow casting onto the emerging photo */}
          <div className="relative h-2.5 bg-[#08090d] rounded-t-md border-t border-zinc-800 shadow-[0_6px_12px_rgba(0,0,0,0.95)] flex items-center justify-between px-2">
            <div className="w-3.5 h-full bg-zinc-800/80 border-r border-zinc-700/60" />
            <div className="w-full h-[1px] bg-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
            <div className="w-3.5 h-full bg-zinc-800/80 border-l border-zinc-700/60" />
          </div>
        </div>

        {/* Layer 1 (z-10): The Rear Dark Slot Cavity */}
        {/* Sits behind the emerging photo to provide mechanical depth to the slot mouth */}
        <div className="absolute left-0 right-0 top-[calc(100%-8px)] h-8 bg-[#090a0f] rounded-b-xl border border-zinc-800 border-t-0 shadow-[inset_0_4px_8px_rgba(0,0,0,0.95)] z-10 mx-1 flex items-end justify-between px-3 pb-1">
          <div className="w-3 h-3 bg-zinc-800/50 rounded-xs" />
          <div className="w-3 h-3 bg-zinc-800/50 rounded-xs" />
        </div>
      </div>

      {/* Layer 2 (z-20): Photo Ejection Viewport */}
      {/* Tucked directly underneath the Top Housing (Layer 3) with negative margin */}
      {/* Masked at the slit line with overflow-hidden so the photo emerges directly out of the slit */}
      <div className="relative w-full flex justify-center overflow-hidden -mt-4 pb-6 z-20 print:overflow-visible print:m-0 print:p-0">
        <motion.div
          key={replayKey}
          initial={{ y: '-102%' }}
          animate={{ y: ['-102%', '0.4%', '0%'] }}
          transition={{
            duration: 3.8,
            times: [0, 0.94, 1],
            ease: [0.22, 0.9, 0.35, 1],
            delay: 0.35,
          }}
          onAnimationComplete={() => setIsEjecting(false)}
          className="flex justify-center w-full print:transform-none"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
