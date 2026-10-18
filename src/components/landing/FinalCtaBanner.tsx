'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';
import { fadeUp } from './animations';

export function FinalCtaBanner() {
  return (
    <AnimatedSection className="relative w-full bg-tertiary-fixed text-on-tertiary-fixed py-24 sm:py-28 md:py-36 overflow-hidden">
      {/* Top Organic Wave Divider: Transitioning from cream linen into sweet pink */}
      <div className="w-full overflow-hidden leading-none absolute -top-1 left-0 right-0 select-none pointer-events-none z-20">
        <svg
          className="w-full h-16 sm:h-20 md:h-28 lg:h-32 block fill-background"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,0L0,0Z" />
        </svg>
      </div>

      {/* Ambient gradients */}
      <div
        className="absolute right-0 top-0 w-[400px] h-[400px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(254,174,222,0.5) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute left-0 bottom-0 w-[300px] h-[300px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(84,27,68,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-margin flex flex-col items-center text-center relative z-10">
        <motion.span
          variants={fadeUp}
          custom={0}
          className="font-label-md text-label-md text-tertiary tracking-widest font-bold mb-2 inline-block uppercase"
        >
          Get your best smile ready
        </motion.span>
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="font-headline-lg text-headline-lg md:text-[46px] md:leading-[54px] text-tertiary tracking-tight font-serif"
          style={{ textWrap: 'balance', letterSpacing: '-0.02em' }}
        >
          Let&apos;s create some magic.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="font-body-md text-body-md text-on-tertiary-fixed-variant max-w-md mt-space-xs mb-space-lg"
          style={{ textWrap: 'pretty' }}
        >
          Turn on your camera, pick your signature frame, and capture memorable keepsake strips right now.
        </motion.p>
        <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 justify-center">
          <Link
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-lg py-4 rounded-lg shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] font-bold"
            href="/solo"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            <span>Start Photobooth Now</span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Organic Wave Divider */}
      <div className="w-full overflow-hidden leading-none absolute -bottom-1 left-0 right-0 select-none pointer-events-none z-20">
        <svg
          className="w-full h-16 sm:h-20 md:h-28 lg:h-32 block fill-surface-container-low"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,205L48,170C96,130,192,54,288,52C384,54,480,130,576,140C672,150,768,92,864,82C960,72,1056,110,1152,148C1248,185,1344,224,1392,242L1440,260L1440,320L0,320Z" />
        </svg>
      </div>
    </AnimatedSection>
  );
}
