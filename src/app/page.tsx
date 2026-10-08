'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { useRoomStore } from '@/stores/useRoomStore';
import { useAuth } from '@/hooks/useAuth';
import { createRoom, getRoom } from '@/lib/api';
import { Loader2 } from 'lucide-react';

/* ─── Animation Variants ──────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── Animated Section Wrapper ────────────────────────────────────── */
function AnimatedSection({
  children,
  className,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={false}
      animate={isInView ? 'visible' : undefined}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.section>
  );
}

/* ─── Authentic Showcase: Solo Photobooth Strip ─────────────────────── */
function SoloIllustration() {
  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-gradient-to-b from-surface-container-low to-surface-container flex items-center justify-center p-4 border border-outline-variant/20 shadow-inner">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />

      {/* Tangible Physical Filmstrip Card */}
      <div className="relative group max-w-[130px] w-full flex flex-col items-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105">
        <div className="w-full bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30 flex flex-col items-center">
          {/* Header Stamp */}
          <div className="w-full flex items-center justify-between text-[8px] font-mono font-bold uppercase tracking-wider text-secondary mb-1.5 px-0.5">
            <span>MEMORIES</span>
            <span>VOL. 01</span>
          </div>

          {/* 3 Real Photo Slots */}
          <div className="w-full flex flex-col gap-1.5">
            {[1, 2, 3].map((pose) => (
              <div
                key={pose}
                className="w-full aspect-[4/3] rounded-md overflow-hidden bg-primary/5 border border-outline-variant/20 relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary-container/20 via-transparent to-primary/10" />
                <span className="material-symbols-outlined text-primary/40 text-[20px]">
                  photo_camera
                </span>
                <span className="absolute bottom-1 right-1 text-[7px] font-mono text-on-surface-variant font-bold">
                  0{pose}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Stamp */}
          <div className="mt-2 w-full text-center border-t border-dashed border-outline-variant/30 pt-1">
            <span className="text-[7px] font-bold uppercase tracking-widest text-primary block">
              PHOTOBOOTH ARCHIVE
            </span>
          </div>
        </div>

        {/* Studio Stamp Badge */}
        <div className="absolute -bottom-2.5 -right-3 bg-secondary-container text-on-secondary-fixed px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-extrabold uppercase shadow-sm border border-secondary/20">
          300 DPI Strip
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-xs text-on-surface border border-outline-variant/30 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase font-bold shadow-xs">
        Solo Session
      </div>
      <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-xs text-secondary border border-outline-variant/30 px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-bold shadow-xs">
        <span className="material-symbols-outlined text-[15px]">timer</span>
        <span>3s / 5s / 10s</span>
      </div>
    </div>
  );
}

/* ─── Authentic Showcase: Duo Room Synchronized Strip ──────────────── */
function DuoIllustration() {
  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-gradient-to-b from-surface-container-low to-surface-container flex items-center justify-center p-4 border border-outline-variant/20 shadow-inner">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Tangible Twin Companion Polaroid Card */}
      <div className="relative group max-w-[200px] w-full bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 drop-shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase tracking-wider text-primary mb-2">
          <span>DUO SYNC</span>
          <span className="inline-flex items-center gap-1 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Side-by-Side Dual Feeds */}
        <div className="grid grid-cols-2 gap-2">
          {/* Host Box */}
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-primary/5 border border-outline-variant/20 relative flex flex-col items-center justify-center p-1">
            <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
              YOU
            </span>
          </div>

          {/* Guest Box */}
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-primary/5 border border-outline-variant/20 relative flex flex-col items-center justify-center p-1">
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed/60 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-tertiary text-[16px]">person_add</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-tertiary">
              FRIEND
            </span>
          </div>
        </div>

        {/* Sync Shutter Indicator */}
        <div className="mt-2.5 pt-1.5 border-t border-dashed border-outline-variant/30 flex items-center justify-between text-[8px] font-mono font-bold uppercase text-on-surface-variant">
          <span>SHUTTER SYNC</span>
          <span className="text-secondary font-bold">1-CLICK BOTH</span>
        </div>

        {/* Floating live tag */}
        <div className="absolute -bottom-2.5 -right-2 bg-primary text-on-primary px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-extrabold uppercase shadow-sm">
          Twin Polaroid
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-xs text-on-surface border border-outline-variant/30 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase font-bold shadow-xs">
        With Companion
      </div>
      <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-xs text-primary border border-outline-variant/30 px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-bold shadow-xs">
        <span className="material-symbols-outlined text-[15px]">wifi</span>
        <span>WebRTC P2P</span>
      </div>
    </div>
  );
}

/* ─── Frames Showcase Data ────────────────────────────────────────── */
interface FrameShowcaseItem {
  id: string;
  name: string;
  layout: string;
  tag: string;
  tagBg: string;
  tagText: string;
  description: string;
  assetUrl: string;
  poses: number;
  printSize: string;
  styleVibe: string;
  features: string[];
}

const SIGNATURE_FRAMES: FrameShowcaseItem[] = [
  {
    id: 'frame_strip_pink_default',
    name: 'Powder Pink Y2K Strip',
    layout: '3-Pose Vertical Strip',
    tag: 'Bestseller',
    tagBg: 'bg-secondary-container',
    tagText: 'text-on-secondary-container',
    description:
      'The iconic retro photostrip format featuring playful Y2K sparkles, "IT GIRL" enamel pin, baby blue heart charm, and vintage editorial date stamp. Fits right into clear phone cases and journal covers.',
    assetUrl: '/frames/y2k_strip_pink.svg',
    poses: 3,
    printSize: '5 × 15 cm Photostrip',
    styleVibe: 'Y2K Scrapbook & Powder Pink',
    features: ['3 stacked candid poses', 'Acid lime enamel pin', 'Masking tape accents', 'Editorial archive footer'],
  },
  {
    id: 'frame_grid_cherry_default',
    name: 'Chocolate Cherry 2×2 Grid',
    layout: 'Square 4-Grid Collage',
    tag: 'Iconic Duo',
    tagBg: 'bg-primary',
    tagText: 'text-on-primary',
    description:
      'High-contrast rich espresso cherry frame with neon lime accents, lightning bolt pin, and official archive stamp. Balanced 2×2 symmetry made specifically for couples, friendships, and double portraits.',
    assetUrl: '/frames/y2k_grid_cherry.svg',
    poses: 4,
    printSize: '10 × 10 cm Square Print',
    styleVibe: 'Cherry Contrast & Neon Bolt',
    features: ['2×2 square symmetry', 'Lightning bolt charm', 'Dark editorial border', 'Approved stamp seal'],
  },
  {
    id: 'frame_polaroid_butter_default',
    name: 'Buttercream Duo Polaroid',
    layout: 'Double Polaroid Postcard',
    tag: 'Warm Vintage',
    tagBg: 'bg-tertiary-fixed',
    tagText: 'text-tertiary',
    description:
      'Sun-drenched pastel buttercream background with twin horizontal frames, washi tape overlays, and cursive "Golden Hour Moments" calligraphy. Plenty of breathing room for physical notes and memories.',
    assetUrl: '/frames/y2k_polaroid_butter.svg',
    poses: 2,
    printSize: '10 × 15 cm Postcard',
    styleVibe: 'Golden Hour & Butter Cream',
    features: ['2 wide cinematic slots', 'Pastel washi tape decals', 'Golden hour calligraphy', 'Generous memo border'],
  },
  {
    id: 'frame_collage_lavender_default',
    name: 'Lavender Pop 6-Slot Collage',
    layout: 'Mini Collage 6-Grid',
    tag: 'Party Edition',
    tagBg: 'bg-[#BEE3F8]',
    tagText: 'text-[#1230c7]',
    description:
      'Full-sheet 6-pose collage with cobalt blue borders, pastel star and heart emblems, and verified Scribblepie studio imprint. Maximize your laughs and candid reactions in a single keepsake sheet.',
    assetUrl: '/frames/y2k_collage_lavender.svg',
    poses: 6,
    printSize: 'Full Keepsake Collage',
    styleVibe: 'Cobalt & Lavender Pop',
    features: ['6 dynamic candid shots', 'Enamel badge pins', 'Verified studio seal', 'Maximum pose variety'],
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setRoom, setRoomStep } = useRoomStore();

  const [duoCode, setDuoCode] = useState('');
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawClean = duoCode.trim().toUpperCase();
    if (!rawClean) {
      setRoomNotice('Please enter a room code first.');
      return;
    }
    const cleanCode = rawClean.startsWith('PB-') ? rawClean : `PB-${rawClean}`;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/room/${cleanCode}`);
      return;
    }

    setIsJoiningRoom(true);
    setRoomNotice(`Connecting to room ${cleanCode}...`);
    try {
      const room = await getRoom(cleanCode);
      const code = room.room_code || cleanCode;
      const roomId = code.toLowerCase();

      // User joining with a code is always a GUEST
      const role = 'guest';

      setRoom(roomId, code, role);
      setRoomStep('WAITING');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_role_${roomId}`, 'guest');
        sessionStorage.setItem(`room_role_${cleanCode}`, 'guest');
      }
      router.push(`/room/${roomId}`);
    } catch (err: unknown) {
      console.error('Failed to join room:', err);
      setRoomNotice('Room not found or expired. Please check your room code.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleCreateDuo = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/');
      return;
    }

    setIsCreatingRoom(true);
    setRoomNotice('Creating your secure duo room...');
    try {
      const res = await createRoom();
      const code = res.room_code;
      const roomId = code.toLowerCase();

      setRoom(roomId, code, 'host');
      setRoomStep('WAITING');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_role_${roomId}`, 'host');
        sessionStorage.setItem(`room_role_${code.toUpperCase()}`, 'host');
      }
      setRoomNotice(`Room ${code} created! Redirecting to waiting room...`);
      router.push(`/room/${roomId}`);
    } catch (err: unknown) {
      console.error('Failed to create room:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create room. Please try again.';
      setRoomNotice(`Error: ${msg}`);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const currentFrame = SIGNATURE_FRAMES[activeFrameIndex];

  return (
    <div className="bg-background font-body-md text-on-surface selection:bg-tertiary-fixed selection:text-tertiary min-h-screen flex flex-col">
      {/* Universal Responsive Navbar */}
      <Navbar />

      <main className="w-full pt-16 md:pt-20 bg-background flex-1">
        <div className="flex flex-col w-full">
          {/* ========================================================================
              HERO TOP CURVED BANNER (Mustard Amber): with ambient glow + seamless wave
              ======================================================================== */}
          <AnimatedSection className="relative w-full bg-secondary-container text-on-secondary-fixed pt-space-xl overflow-hidden">
            {/* Ambient radial glow for depth */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-25 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(254,161,43,0.35) 0%, transparent 65%)',
              }}
            />

            <div className="max-w-7xl mx-auto px-margin flex flex-col items-center text-center pb-space-xl relative z-10">

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-headline-lg md:text-[56px] md:leading-[64px] lg:text-[64px] lg:leading-[72px] text-on-secondary-fixed tracking-tight max-w-3xl font-serif"
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
              <motion.div variants={fadeUp} custom={3} className="mt-space-lg flex flex-wrap gap-3 justify-center">
                <Link
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-lg py-3.5 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] font-bold"
                  href="/solo"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Start Snapping</span>
                </Link>
                <a
                  className="inline-flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-md text-label-md px-space-lg py-3.5 rounded-xl border border-outline-variant/30 transition-all duration-200 hover:bg-surface-container-lowest hover:shadow-xs active:scale-[0.98] font-bold"
                  href="#modes"
                >
                  <span>Explore Modes</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </a>
                <a
                  className="inline-flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-sm text-secondary font-label-md text-label-md px-space-lg py-3.5 rounded-xl border border-outline-variant/30 transition-all duration-200 hover:bg-surface-container-lowest hover:shadow-xs active:scale-[0.98] font-bold"
                  href="#frames"
                >
                  <span className="material-symbols-outlined text-[18px]">palette</span>
                  <span>View Frames</span>
                </a>
              </motion.div>
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

          {/* ========================================================================
              GRAPHIC EMBLEM / STAMP LOCKUP SECTION
              ======================================================================== */}
          <AnimatedSection className="relative w-full bg-background pt-space-md pb-space-sm" delay={0.1}>
            <div className="max-w-7xl mx-auto px-margin flex flex-col items-center justify-center">
              {/* Curved Circular Stamp Badge */}
              <motion.div variants={scaleIn} className="relative w-44 h-44 flex items-center justify-center -mt-10 select-none">
                <svg
                  className="w-full h-full animate-[spin_24s_linear_infinite]"
                  viewBox="0 0 200 200"
                >
                  <defs>
                    <path
                      d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
                      fill="none"
                      id="circleTextPath"
                    />
                  </defs>
                  <text className="font-label-md text-[13px] fill-secondary font-bold uppercase tracking-[0.24em]">
                    <textPath href="#circleTextPath" startOffset="0%">
                      Snapbooth Studio • Pure Joy In Every Shot •
                    </textPath>
                  </text>
                </svg>
                {/* Center Cobalt Starburst */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-18 h-18 rounded-full bg-primary flex items-center justify-center shadow-xs" style={{ width: '72px', height: '72px' }}>
                    <svg className="w-9 h-9 fill-surface-bright" viewBox="0 0 24 24">
                      <path d="M12 0L14.2 8.5L22.6 6.1L17.2 13L23.8 17.5L15.3 18.2L16.2 24L10.7 19.3L6 24L7.5 17.8L0 18.2L5.8 13.5L0.2 7.1L8.5 8.7L9.5 0.5L12 0Z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} custom={0} className="mt-space-xs text-center" id="modes">
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

          {/* ========================================================================
              DUAL MAIN SERVICE CARDS: SOLO & ONLINE DUO ROOM
              ======================================================================== */}
          <AnimatedSection className="w-full bg-background py-space-lg">
            <div className="max-w-7xl mx-auto px-margin">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter max-w-5xl mx-auto items-stretch">
                {/* CARD 1: SOLO PHOTOBOOTH */}
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="card-spotlight bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col justify-between shadow-sm border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <SoloIllustration />
                    {/* Content */}
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
                      <ul className="mt-space-md flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface">
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>Flexible shutter timer: 3s, 5s, or 10s intervals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>Authentic retro filters: Digicam Glow, B&amp;W 90s, and Warm Grain</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>Iconic 3-pose strip, 2×2 square grid, or mini collage formats</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* CTA: pinned to bottom */}
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
                  variants={fadeUp}
                  custom={1}
                  className="card-spotlight bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col justify-between shadow-sm border border-outline-variant/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <DuoIllustration />
                    {/* Content */}
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
                      <ul className="mt-space-md flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface">
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>Real-time side-by-side synchronized video streams</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>Simultaneous countdown for perfectly timed poses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <span>Automatic dual-screen collage merged into one physical print</span>
                        </li>
                      </ul>
                      {/* Duo Interactive Code Join Box */}
                      <div className="mt-space-md p-space-sm bg-surface-container-low rounded-xl border border-surface-container">
                        <label
                          className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 font-bold"
                          htmlFor="duoCode"
                        >
                          Have a friend&apos;s room code?
                        </label>
                        <form onSubmit={handleJoin} className="flex items-center gap-2">
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
                  {/* CTA: pinned to bottom */}
                  <div className="pt-space-md mt-auto">
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase py-3.5 px-space-md rounded-xl shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                      id="createDuoBtn"
                      type="button"
                      disabled={isCreatingRoom || isJoiningRoom}
                      onClick={handleCreateDuo}
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

          {/* ========================================================================
              SECTION: SIGNATURE FRAME COLLECTION SHOWCASE
              ======================================================================== */}
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

                {/* Interactive Frame Tab Bar */}
                <motion.div variants={fadeUp} custom={3} className="mt-space-lg flex flex-wrap gap-2 justify-center max-w-3xl">
                  {SIGNATURE_FRAMES.map((frame, index) => {
                    const isActive = index === activeFrameIndex;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => setActiveFrameIndex(index)}
                        className={`px-4 py-2 rounded-full font-label-md text-label-md uppercase tracking-wider transition-all duration-200 cursor-pointer font-bold flex items-center gap-2 ${isActive
                          ? 'bg-primary text-on-primary shadow-dark scale-105'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-secondary-fixed' : 'bg-primary/40'}`} />
                        <span>{frame.name}</span>
                      </button>
                    );
                  })}
                </motion.div>
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
                      <div className="relative group max-w-[280px] w-full flex items-center justify-center py-2">
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

                        {/* Tech Spec Highlights */}
                        <div className="mt-space-md p-3.5 bg-secondary-container/20 rounded-xl border border-secondary-container/40 flex flex-wrap items-center justify-between gap-3 text-xs font-label-sm text-on-surface">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                            <span><strong>Zero Cloud Storage:</strong> Client-side render</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-secondary text-[18px]">auto_awesome</span>
                            <span><strong>Resolution:</strong> 300 DPI Ultra Clear</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-tertiary text-[18px]">gif</span>
                            <span><strong>Animated GIF:</strong> Auto-compiled</span>
                          </div>
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
                    <motion.div
                      key={item.id}
                      variants={fadeUp}
                      custom={idx}
                      onClick={() => setActiveFrameIndex(idx)}
                      className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all duration-200 flex flex-col justify-between ${isSelected
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
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* ========================================================================
              FINAL CTA BANNER: Connected with seamless wave transitions
              ======================================================================== */}
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

            {/* Bottom Organic Wave Divider: Transitioning smoothly from sweet pink into Footer background */}
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
        </div>
      </main>

      {/* Shared Footer Component (hideWave=true since section above smoothly waves into Footer) */}
      <Footer hideWave />
    </div>
  );
}
