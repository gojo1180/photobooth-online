'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  count: number;
  isActive: boolean;
  poseIndex?: number;
  totalPoses?: number;
}

export function CountdownOverlay({
  count,
  isActive,
  poseIndex,
  totalPoses,
}: CountdownOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/25 backdrop-blur-[2px]">
      {/* Pose indicator pill */}
      {typeof poseIndex === 'number' && typeof totalPoses === 'number' && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-primary/90 text-white border border-white/20 text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md font-[var(--font-space-grotesk)]">
          Pose {poseIndex + 1} of {totalPoses}
        </div>
      )}

      {/* Animated Big Refined Countdown Number */}
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-surface-container-lowest/95 border border-outline-variant/30 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-primary"
        >
          <span className="font-[var(--font-vollkorn)] text-5xl md:text-6xl font-bold leading-none text-primary">
            {count}
          </span>
          <span className="font-[var(--font-space-grotesk)] text-[10px] uppercase tracking-[0.2em] font-extrabold text-secondary mt-1">
            {count === 1 ? 'SMILE!' : 'GET READY!'}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
