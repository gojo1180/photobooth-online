'use client';

import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import type { UserRole } from '@/stores/useRoomStore';
import type { RoomLayoutItem } from '../types';
import {
  Copy,
  Check,
  Camera,
  ArrowRight,
  Users,
  Radio,
  Sparkles,
  CheckCircle2,
  Video,
  Timer,
  Volume2,
  VolumeX,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface RoomWaitingStepProps {
  cleanCode: string;
  role: UserRole | null;
  signalingMode: string | null;
  peerStatus: string;
  connectionError: string | null;
  retryConnection: () => void;
  isCameraReady: boolean;
  cameraError: string | null;
  retryCamera: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCompanionConnected: boolean;
  layouts: RoomLayoutItem[];
  selectedLayoutId: string | null;
  onSelectLayout: (layoutId: string, poses: number) => void;
  timerDuration: number;
  onSelectTimer: (sec: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  canStartSession: boolean;
  onStartSession: () => void;
}

export function RoomWaitingStep({
  cleanCode,
  role,
  signalingMode,
  peerStatus,
  connectionError,
  retryConnection,
  isCameraReady,
  cameraError,
  retryCamera,
  localStream,
  remoteStream,
  isCompanionConnected,
  layouts,
  selectedLayoutId,
  onSelectLayout,
  timerDuration,
  onSelectTimer,
  soundEnabled,
  onToggleSound,
  canStartSession,
  onStartSession,
}: RoomWaitingStepProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const localWaitingVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteWaitingVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localWaitingVideoRef.current && localStream) {
      localWaitingVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteWaitingVideoRef.current && remoteStream) {
      remoteWaitingVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(cleanCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="w-full pt-16 md:pt-20 bg-background">
        {/* Top Hero Banner */}
        <section className="relative w-full bg-secondary-container text-on-secondary-container pt-8 sm:pt-12 pb-32 sm:pb-36 md:pb-40 overflow-hidden">
          <div className="max-w-5xl mx-auto px-margin text-center relative z-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 text-primary border border-outline-variant/30 text-[11px] font-extrabold uppercase tracking-widest mb-3 shadow-xs font-mono">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>ONLINE DUO ROOM • {role === 'host' ? 'HOST' : 'GUEST'}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-on-secondary-container">
              WAITING ROOM &amp; FORMAT
            </h1>
            <p className="font-serif text-sm sm:text-base text-on-secondary-container/90 mt-2 max-w-xl">
              Invite your companion using your room code, confirm your live video feeds, and choose your print layout before starting.
            </p>

            {/* Stepper Pills matching Solo mode */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="bg-primary text-on-primary font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
                1. WAITING &amp; FORMAT
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full opacity-80">
                2. PHOTO SESSION
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full opacity-80">
                3. EDIT BINGKAI
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-secondary-container/60">arrow_forward</span>
              <span className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-full opacity-80">
                4. PRINT &amp; EXPORT
              </span>
            </div>
          </div>

          {/* Scallop Wave Break to Linen Surface */}
          <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
            <svg
              className="relative block w-full h-14 sm:h-18 md:h-24 fill-background"
              preserveAspectRatio="none"
              viewBox="0 0 1440 320"
            >
              <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        {/* Waiting Room Workspace */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 sm:py-12">
          {/* Room Code & Companion Status Banner */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant font-mono block mb-1">
                ROOM ACCESS CODE
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary tracking-wider bg-surface-container-low px-4 py-1.5 rounded-2xl border border-outline-variant/40">
                  {cleanCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-3 rounded-2xl bg-surface-container hover:bg-primary/10 text-primary transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-2 max-w-md">
                Share this code with your friend. When they enter it in the Lobby, they will instantly join this room.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-xs font-bold uppercase tracking-wider text-on-surface shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Room Link'}</span>
              </button>

              <div
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs border ${
                  isCompanionConnected
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCompanionConnected ? 'bg-green-600 animate-ping' : 'bg-amber-600'
                  }`}
                />
                <span>
                  {isCompanionConnected
                    ? `Companion Connected • ${signalingMode === 'supabase' ? 'Backup' : 'Studio'} Link`
                    : 'Waiting for companion to join...'}
                </span>
              </div>
            </div>
          </div>

          {(connectionError || peerStatus === 'error' || peerStatus === 'disconnected') && (
            <div className="max-w-4xl mx-auto mb-8 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" role="status">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">Koneksi Duo perlu dipulihkan</p>
                  <p className="text-xs mt-0.5">{connectionError || 'Koneksi dengan companion terputus.'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={retryConnection}
                className="px-4 py-2 rounded-xl bg-amber-900 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sambungkan Ulang
              </button>
            </div>
          )}

          {/* Dual Camera Stream Check Area */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                CAMERA CHECK
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                Verify Video &amp; Lighting
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Make sure both cameras are active and well-lit before taking your snapshots.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Your Camera Feed Card */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Video className="w-4 h-4" /> Your Camera ({role === 'host' ? 'Host' : 'Guest'})
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCameraReady
                      ? 'bg-green-100 text-green-800'
                      : cameraError
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isCameraReady ? 'LIVE' : cameraError ? 'BLOCKED' : 'STARTING'}
                  </span>
                </div>
                <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  {localStream ? (
                    <video
                      ref={localWaitingVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : cameraError ? (
                    <div className="flex flex-col items-center gap-3 text-white/70 text-xs text-center px-6">
                      <AlertTriangle className="w-8 h-8 text-amber-300" />
                      <span>{cameraError}</span>
                      <button
                        type="button"
                        onClick={retryCamera}
                        className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Coba Kamera Lagi
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/50 text-xs">
                      <Camera className="w-8 h-8 animate-pulse" />
                      <span>Initializing Camera...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Companion Camera Card */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Companion Feed ({role === 'host' ? 'Guest' : 'Host'})
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompanionConnected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isCompanionConnected ? 'CONNECTED' : 'WAITING'}
                  </span>
                </div>
                <div className="relative aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  {remoteStream ? (
                    <video
                      ref={remoteWaitingVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center text-white/60">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 animate-pulse">
                        <Radio className="w-7 h-7 text-secondary" />
                      </div>
                      <p className="font-bold text-sm text-white mb-1">
                        Waiting for companion...
                      </p>
                      <p className="text-xs text-white/60 max-w-xs">
                        Ask your friend to enter code <span className="font-mono text-secondary font-bold">{cleanCode}</span> in the Lobby.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Layout Format Selection */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                STEP 01 / 04 • FORMAT SELECTION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                Pilih Format Cetak Bingkai
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                {role === 'host'
                  ? 'Pilih layout foto favorit. Pilihan format Anda akan langsung tersinkronisasi ke teman Anda.'
                  : 'Host sedang memilih format bingkai di bawah ini.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {layouts.map((layout) => {
                const isSelected = selectedLayoutId === layout.id;
                return (
                  <div
                    key={layout.id}
                    onClick={() => role === 'host' && onSelectLayout(layout.id, layout.poses)}
                    className={`group relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                      role === 'host' ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? 'bg-secondary-fixed text-on-secondary-fixed ring-2 ring-primary border-primary shadow-md -translate-y-1'
                        : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/40 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top badge & icon */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                          {layout.poses} POSES
                        </span>
                        {layout.tag && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed">
                            {layout.tag}
                          </span>
                        )}
                      </div>

                      {/* Preview Illustration / SVG */}
                      <div className="relative aspect-[4/3] w-full rounded-xl bg-surface-container-low/60 overflow-hidden flex items-center justify-center p-3 mb-3 border border-outline-variant/20 group-hover:scale-[1.02] transition-transform">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={layout.assetUrl}
                          alt={layout.name}
                          className="h-full object-contain drop-shadow-sm select-none pointer-events-none"
                        />
                      </div>

                      <h3 className="font-serif text-base font-bold text-primary">
                        {layout.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {layout.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-secondary font-mono">{layout.size}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shutter Timer & Sound Options (Matching Solo Mode) */}
          <div className="max-w-2xl mx-auto mb-10 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-primary">
                  Shutter Timer &amp; Suara
                </h4>
                <p className="text-xs text-on-surface-variant">
                  {role === 'host'
                    ? 'Atur hitung mundur otomatis untuk kedua kamera.'
                    : `Durasi timer: ${timerDuration} detik (diatur oleh Host).`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer Duration Pills */}
              <div className="inline-flex rounded-xl p-1 bg-surface-container-low border border-outline-variant/30">
                {[3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    disabled={role !== 'host'}
                    onClick={() => onSelectTimer(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      timerDuration === sec
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    } ${role === 'host' ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={onToggleSound}
                className={`p-2.5 rounded-xl border border-outline-variant/30 transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-surface-container-low text-on-surface-variant'
                }`}
                title={soundEnabled ? 'Suara shutter aktif' : 'Suara shutter nonaktif'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Launch Action Bar */}
          <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-md text-center flex flex-col items-center gap-3">
            {role === 'host' ? (
              <>
                <button
                  type="button"
                  disabled={!canStartSession}
                  onClick={onStartSession}
                  className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                    canStartSession
                      ? 'bg-primary hover:bg-primary-container text-on-primary ring-2 ring-primary/40'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <span>
                    {canStartSession
                      ? 'MULAI SESI FOTO (DUAL CAMERA)'
                      : !isCameraReady
                        ? 'MENUNGGU KAMERA ANDA'
                        : 'MENUNGGU COMPANION'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-on-surface-variant">
                  {canStartSession
                    ? 'Kamera Anda dan teman sudah siap! Klik tombol di atas untuk membuka sesi foto.'
                    : 'Sesi Duo baru dapat dimulai setelah kedua kamera dan koneksi sinkronisasi siap.'}
                </p>
              </>
            ) : (
              <div className="py-2 flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center animate-spin">
                  <Sparkles className="w-4 h-4 text-on-secondary-fixed" />
                </div>
                <p className="font-serif font-bold text-lg text-primary">
                  {isCompanionConnected ? 'Terhubung dengan Host!' : 'Menunggu koneksi Host…'}
                </p>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Menunggu host memilih format dan meluncurkan sesi pengambilan foto...
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
