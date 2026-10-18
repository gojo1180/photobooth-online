'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { SoloIllustration, DuoIllustration } from './ModeIllustrations';
import { fadeUp, scaleIn } from './animations';

interface CaptureModesSectionProps {
  duoCode: string;
  setDuoCode: (code: string) => void;
  isJoiningRoom: boolean;
  isCreatingRoom: boolean;
  roomNotice: string | null;
  onJoin: (e?: React.FormEvent) => void;
  onCreateDuo: () => void;
}

export function CaptureModesSection({
  duoCode,
  setDuoCode,
  isJoiningRoom,
  isCreatingRoom,
  roomNotice,
  onJoin,
  onCreateDuo,
}: CaptureModesSectionProps) {
  return (
    <>
      {/* GRAPHIC EMBLEM / STAMP LOCKUP SECTION */}
      <AnimatedSection id="modes" className="relative w-full bg-background pt-space-md pb-space-sm scroll-mt-20" delay={0.1}>
        <div className="max-w-7xl mx-auto px-margin flex flex-col items-center justify-center">
          {/* Curved Circular Stamp Badge */}

          <motion.div variants={fadeUp} custom={0} className="mt-space-xs text-center">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
              Studio Capture Modes
            </span>
            <h2
              className="font-headline-lg text-headline-lg text-on-surface mt-1 font-serif"
              style={{ textWrap: 'balance' }}
            >
              Choose how you want to shoot
            </h2>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* DUAL MAIN SERVICE CARDS: SOLO & ONLINE DUO ROOM */}
      <AnimatedSection className="w-full bg-background py-space-lg">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter max-w-5xl mx-auto items-stretch">
            {/* CARD 1: SOLO PHOTOBOOTH */}
            <motion.div
              id="solo-card"
              variants={fadeUp}
              custom={0}
              className="card-spotlight bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col justify-between shadow-sm border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md scroll-mt-28"
            >
              <div>
                <SoloIllustration />
                <div className="mt-space-md">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold">
                    Option 01
                  </span>
                  <h3 className="font-headline-md text-headline-md text-primary mt-1 font-serif">
                    Solo Photobooth
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs" style={{ textWrap: 'pretty' }}>
                    An unrushed studio session at your own pace. Pose freely, try spontaneous expressions, and create vintage keepsake photostrips.
                  </p>
                </div>
              </div>
              <div className="pt-space-lg mt-auto">
                <Link
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase py-3.5 px-space-md rounded-xl shadow-xs transition-all duration-200 active:scale-[0.98] text-center font-bold"
                  href="/solo"
                >
                  <span>Start Solo Session</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </motion.div>

            {/* CARD 2: ONLINE DUO ROOM */}
            <motion.div
              id="duo-card"
              variants={fadeUp}
              custom={1}
              className="card-spotlight bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col justify-between shadow-sm border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md scroll-mt-28"
            >
              <div>
                <DuoIllustration />
                <div className="mt-space-md">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-bold">
                    Option 02
                  </span>
                  <h3 className="font-headline-md text-headline-md text-primary mt-1 font-serif">
                    Online Duo Room
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs" style={{ textWrap: 'pretty' }}>
                    Connect your photobooth with a friend anywhere in the world using a private code. Synchronized countdown, live side-by-side feed, and twin collage prints.
                  </p>
                  {/* Duo Interactive Code Join Box */}
                  <div className="mt-space-md p-space-sm bg-surface-container-low rounded-xl border border-surface-container">
                    <label
                      className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 font-bold"
                      htmlFor="duoCode"
                    >
                      Have a friend&apos;s room code?
                    </label>
                    <form onSubmit={onJoin} className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-2.5 bg-surface-container-lowest font-headline-md text-[14px] text-on-surface rounded-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-outline/40 border border-surface-container transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(0,28,151,0.1)] focus:border-primary/30 disabled:opacity-60"
                        id="duoCode"
                        maxLength={10}
                        placeholder="PB-ABC123"
                        type="text"
                        value={duoCode}
                        disabled={isJoiningRoom || isCreatingRoom}
                        onChange={(e) => setDuoCode(e.target.value.toUpperCase())}
                      />
                      <button
                        className="px-4 py-2.5 bg-secondary-container hover:bg-secondary text-on-secondary-fixed hover:text-on-secondary font-label-md text-label-md uppercase rounded-lg transition-all duration-200 active:scale-[0.97] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                        id="joinRoomBtn"
                        type="submit"
                        disabled={isJoiningRoom || isCreatingRoom}
                      >
                        {isJoiningRoom && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Join</span>
                      </button>
                    </form>
                    {roomNotice && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-body-sm text-body-sm text-secondary mt-2 font-bold"
                        id="roomNotice"
                      >
                        {roomNotice}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-space-md mt-auto">
                <button
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase py-3.5 px-space-md rounded-xl shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                  id="createDuoBtn"
                  type="button"
                  disabled={isCreatingRoom || isJoiningRoom}
                  onClick={onCreateDuo}
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Room...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Duo Room</span>
                      <span className="material-symbols-outlined text-[18px]">group_add</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
