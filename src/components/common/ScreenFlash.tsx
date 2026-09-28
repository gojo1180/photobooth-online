'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ScreenFlashProps {
  isActive: boolean;
}

export function ScreenFlash({ isActive }: ScreenFlashProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0.95 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed inset-0 z-50 pointer-events-none bg-white"
        />
      )}
    </AnimatePresence>
  );
}
