'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection } from './AnimatedSection';
import { fadeUp } from './animations';
import { SIGNATURE_FRAMES } from './frames-data';

interface SignatureFramesSectionProps {
  activeFrameIndex: number;
  setActiveFrameIndex: (idx: number) => void;
}

export function SignatureFramesSection({
  activeFrameIndex,
  setActiveFrameIndex,
}: SignatureFramesSectionProps) {
  const currentFrame = SIGNATURE_FRAMES[activeFrameIndex];

  return (
    <AnimatedSection id="frames" className="w-full bg-background py-space-xl relative overflow-hidden" delay={0.1}>
      {/* Subtle background ambient graphic */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-tertiary-fixed/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-margin relative z-10">
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center mb-space-xl">
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-headline-lg text-headline-lg md:text-[44px] md:leading-[52px] text-primary tracking-tight max-w-2xl font-serif"
            style={{ textWrap: 'balance' }}
          >
            Curated Retro Frames for Every Memory
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-space-xs"
            style={{ textWrap: 'pretty' }}
          >
            Every snapshot deserves an artisanal border. Explore our authentic vector scrapbook frames, each crafted with custom stickers, archival stamps, and nostalgic typography.
          </motion.p>
        </div>

        {/* Main Featured Interactive Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrame.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto bg-surface-container-lowest rounded-2xl border-2 border-primary/20 shadow-cobalt p-space-md md:p-space-lg"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
              {/* Left Frame Visual Showcase (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl border border-surface-container shadow-inner">
                <div className="landing-frame-stack relative group max-w-[280px] w-full flex items-center justify-center py-2">
                  {/* Authentic SVG Frame Asset from website public library */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentFrame.assetUrl}
                    alt={currentFrame.name}
                    className="w-full max-h-[440px] object-contain drop-shadow-[4px_6px_12px_rgba(0,0,0,0.18)] transition-transform duration-300 group-hover:scale-[1.02]"
                  />

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 backdrop-blur-[1px] rounded-lg">
                    <span className="bg-primary text-on-primary px-3 py-1.5 rounded-full font-label-sm text-label-sm uppercase font-bold shadow-md flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Full Vector SVG
                    </span>
                  </div>
                </div>

                {/* Frame Dimension Footer */}
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-secondary text-[16px]">aspect_ratio</span>
                  <span>{currentFrame.printSize} • {currentFrame.poses} Poses</span>
                </div>
              </div>

              {/* Right Specs & Info (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full pl-0 lg:pl-4">
                <div>
                  {/* Badge Row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase font-extrabold shadow-xs ${currentFrame.tagBg} ${currentFrame.tagText}`}>
                      {currentFrame.tag}
                    </span>
                    <span className="text-secondary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                      {currentFrame.styleVibe}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-headline-lg text-headline-lg text-primary font-serif">
                    {currentFrame.name}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed" style={{ textWrap: 'pretty' }}>
                    {currentFrame.description}
                  </p>

                  {/* Feature Badges Grid */}
                  <div className="mt-space-md grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentFrame.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-surface-container"
                      >
                        <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Row */}
                <div className="mt-space-lg pt-space-sm flex flex-wrap items-center gap-3">
                  <Link
                    href="/solo"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-lg py-3.5 rounded-lg shadow-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    <span>Snap With This Frame</span>
                  </Link>

                  <Link
                    href="/solo"
                    className="inline-flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md uppercase px-space-md py-3.5 rounded-lg border border-surface-container transition-all duration-200 font-bold"
                  >
                    <span>Explore All Presets</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 4 Cards Grid: Side-by-Side Gallery Overview */}
        <div className="mt-space-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter max-w-5xl mx-auto">
          {SIGNATURE_FRAMES.map((item, idx) => {
            const isSelected = idx === activeFrameIndex;
            return (
              <motion.button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Preview ${item.name}`}
                variants={fadeUp}
                custom={idx}
                onClick={() => setActiveFrameIndex(idx)}
                className={`cursor-pointer text-left rounded-xl p-3.5 border-2 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary shadow-cobalt-sm scale-[1.02]'
                    : 'bg-surface-container-lowest/80 border-surface-container hover:border-primary/40 hover:-translate-y-1 hover:shadow-sm'
                }`}
              >
                {/* Mini Thumbnail */}
                <div className="w-full h-44 bg-surface-container-low rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3 border border-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.assetUrl}
                    alt={item.name}
                    className="h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
                      {item.poses} Poses
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${item.tagBg} ${item.tagText}`}>
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="font-headline-md text-[15px] text-primary font-bold line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 line-clamp-2">
                    {item.layout}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-surface-container flex items-center justify-between text-xs font-label-sm">
                  <span className="text-primary font-bold">
                    {isSelected ? 'Active Preview' : 'Click to Inspect'}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {isSelected ? 'check_circle' : 'touch_app'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
