'use client';

import { motion } from 'framer-motion';
import { PhotoboothHero } from '@/components/landing/PhotoboothHero';
import { AnimatedSection } from './AnimatedSection';
import { fadeUp } from './animations';

interface LandingHeroBannerProps {
  duoPreview: boolean;
  setDuoPreview: (val: boolean) => void;
  scrollToSection: (id: string) => void;
}

export function LandingHeroBanner({
  duoPreview,
  setDuoPreview,
  scrollToSection,
}: LandingHeroBannerProps) {
  return (
    <AnimatedSection className="relative w-full bg-secondary-container text-on-secondary-fixed pt-space-xl overflow-hidden">
      {/* Ambient radial glow for depth */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(254,161,43,0.35) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-margin grid lg:grid-cols-2 items-center gap-4 lg:gap-10 pb-space-md relative z-10">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-headline-lg text-[38px] leading-[44px] md:text-[56px] md:leading-[64px] lg:text-[60px] lg:leading-[66px] text-on-secondary-fixed tracking-tight max-w-3xl font-serif"
            style={{ textWrap: 'balance', letterSpacing: '-0.02em' }}
          >
            Capture your best moments in retro style
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="font-body-md text-body-md text-on-secondary-container max-w-lg mt-space-sm text-[16px] leading-[26px]"
            style={{ textWrap: 'pretty' }}
          >
            A vintage-inspired digital photobooth right in your browser. Choose signature frames, snap spontaneous poses, apply 90s digicam filters, and print retro keepsake strips.
          </motion.p>
        </div>
        <PhotoboothHero duoPreview={duoPreview} />
      </div>

      {/* Seamless Organic Wave Break into Linen Cream Body */}
      <div className="w-full overflow-hidden leading-none -mb-[1px] select-none pointer-events-none">
        <svg
          className="w-full h-16 sm:h-20 md:h-28 lg:h-32 block fill-background"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
        </svg>
      </div>
    </AnimatedSection>
  );
}
