'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const handlePrev = () => {
    setActiveFrameIndex(
      activeFrameIndex === 0 ? SIGNATURE_FRAMES.length - 1 : activeFrameIndex - 1
    );
  };

  const handleNext = () => {
    setActiveFrameIndex(
      activeFrameIndex === SIGNATURE_FRAMES.length - 1 ? 0 : activeFrameIndex + 1
    );
  };

  return (
    <AnimatedSection
      id="frames"
      className="w-full bg-[#001C97] pt-20 sm:pt-28 md:pt-32 pb-20 sm:pb-28 relative overflow-hidden text-white"
      delay={0.1}
    >
      {/* Top Organic Wave Divider: Seamless transition from cream background into Cobalt #001C97 Atelier */}
      <div className="w-full overflow-hidden leading-none absolute -top-1 left-0 right-0 select-none pointer-events-none z-20">
        <svg
          className="w-full h-14 sm:h-18 md:h-24 lg:h-28 block fill-background"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,0L0,0Z" />
        </svg>
      </div>

      {/* Soft ambient lighting glows */}
      <div
        className="absolute top-1/4 -right-20 w-[480px] h-[480px] opacity-25 pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(circle, rgba(254,161,43,0.3) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute bottom-10 -left-20 w-[440px] h-[440px] opacity-20 pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(circle, rgba(166,177,255,0.25) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-margin relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-12">


          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-headline-lg text-headline-lg md:text-[44px] md:leading-[52px] text-white tracking-tight max-w-2xl font-serif"
            style={{ textWrap: 'balance' }}
          >
            Curated Retro Frames for Every Memory
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="font-body-md text-body-md text-[#dfe0ff] max-w-xl mt-3 leading-relaxed"
            style={{ textWrap: 'pretty' }}
          >
            Every snapshot deserves an artisanal border. Authentic vector scrapbook frames crafted
            with hand-drawn stickers, archival stamps, and nostalgic typography.
          </motion.p>
        </div>

        {/* 3-Column Studio Atelier Stage: Contact Sheet (Left) • Hero Print (Center) • Specs (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* COLUMN 1: Studio Contact Sheet Rail (Left Side) */}
          <div className="lg:col-span-3 flex flex-col order-2 lg:order-1">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/15">
              <span className="font-label-sm text-[11px] uppercase tracking-widest text-white/80 font-bold">
                Studio Contact Sheet
              </span>
              <span className="text-[11px] text-secondary-container font-mono font-bold">
                0{activeFrameIndex + 1} / 0{SIGNATURE_FRAMES.length}
              </span>
            </div>

            {/* Thumbnail Selection Reel */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
              {SIGNATURE_FRAMES.map((item, idx) => {
                const isSelected = idx === activeFrameIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveFrameIndex(idx)}
                    className={`group relative text-left p-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 cursor-pointer ${isSelected
                      ? 'bg-white text-[#001C97] shadow-lg ring-2 ring-secondary-container'
                      : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white backdrop-blur-xs'
                      }`}
                  >
                    {/* Miniature Frame Silhouette */}
                    <div className="w-12 h-16 shrink-0 flex items-center justify-center p-1 rounded-lg bg-white/90 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.assetUrl}
                        alt={item.name}
                        className={`h-full object-contain transition-transform duration-200 ${isSelected
                          ? 'scale-110 drop-shadow-sm'
                          : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'
                          }`}
                      />
                    </div>

                    {/* Meta Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono font-bold ${isSelected ? 'text-secondary' : 'text-secondary-container'
                            }`}
                        >
                          0{idx + 1}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-[#001C97] text-white' : 'bg-white/20 text-white'
                            }`}
                        >
                          {item.poses} Poses
                        </span>
                      </div>
                      <h4
                        className={`font-headline-md text-xs font-bold truncate mt-1 ${isSelected ? 'text-[#001C97]' : 'text-white'
                          }`}
                      >
                        {item.name}
                      </h4>
                      <p
                        className={`text-[11px] truncate ${isSelected ? 'text-on-surface-variant' : 'text-[#dfe0ff]'
                          }`}
                      >
                        {item.layout}
                      </p>
                    </div>

                    {/* Active Accent Pill on the edge */}
                    {isSelected && (
                      <motion.div
                        layoutId="activeContactSheetBar"
                        className="absolute -left-1 top-2.5 bottom-2.5 w-1 bg-secondary-container rounded-r-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: Centerpiece Physical Print Showcase */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFrame.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[290px] flex flex-col items-center py-4"
              >
                {/* Washi Masking Tape Accent */}
                <div
                  aria-hidden="true"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#ffdcbd] rotate-[-2deg] shadow-md border-y border-dashed border-[#895100]/30 z-20 pointer-events-none flex items-center justify-center"
                >
                  <span className="text-[9px] font-mono tracking-widest uppercase text-[#693d00] select-none font-bold">
                    PB ARCHIVE • NO. 0{activeFrameIndex + 1}
                  </span>
                </div>

                {/* Vector Frame Asset with photorealistic drop-shadow */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentFrame.assetUrl}
                  alt={currentFrame.name}
                  className="w-full max-h-[460px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.02]"
                />

                {/* Print Dimension Footer */}
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-label-sm text-secondary-container font-bold uppercase tracking-widest">
                  <span>{currentFrame.printSize}</span>
                  <span>•</span>
                  <span>{currentFrame.poses} Poses</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Lookbook Pagination Controls */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous frame"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono font-bold text-white/90 px-2">
                0{activeFrameIndex + 1} / 0{SIGNATURE_FRAMES.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next frame"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* COLUMN 3: Editorial Narrative, Features & CTAs (Right Side) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-3 pl-0 lg:pl-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFrame.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >

                {/* Title & Story */}
                <h3 className="font-headline-lg text-3xl sm:text-4xl text-white font-serif tracking-tight">
                  {currentFrame.name}
                </h3>
                <p
                  className="font-body-md text-body-md text-[#dfe0ff] mt-3 leading-relaxed"
                  style={{ textWrap: 'pretty' }}
                >
                  {currentFrame.description}
                </p>

                {/* Features (Cardless 2-Column Checklist) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-5 my-6 pt-5 border-t border-white/15">
                  {currentFrame.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                        <Check size={12} className="text-[#693d00] stroke-[3]" />
                      </div>
                      <span className="font-body-sm text-sm text-white font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Archival Spec Row */}
                <div className="grid grid-cols-3 gap-3 py-3.5 px-1 border-y border-white/15 mb-7">
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-[#dfe0ff]/70">
                      Layout
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block truncate">
                      {currentFrame.layout}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-[#dfe0ff]/70">
                      Paper Size
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block truncate">
                      {currentFrame.printSize}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-[#dfe0ff]/70">
                      Finish
                    </span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      Matte SVG
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/solo"
                    className="inline-flex items-center gap-2.5 bg-white hover:bg-[#dfe0ff] text-[#001C97] font-label-md text-xs uppercase px-7 py-3.5 rounded-full shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-bold"
                  >
                    <Camera size={16} />
                    <span>Snap With This Frame</span>
                  </Link>

                  <Link
                    href="/solo"
                    className="inline-flex items-center gap-2 text-white hover:text-secondary-container font-label-md text-xs uppercase font-bold px-4 py-3.5 transition-colors group"
                  >
                    <span>Explore All Presets</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
