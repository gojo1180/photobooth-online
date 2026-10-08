'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { useRoomStore } from '@/stores/useRoomStore';
import { useAuth } from '@/hooks/useAuth';
import { createRoom, getRoom } from '@/lib/api';
import { Users, Plus, ArrowRight, KeyRound, Loader2 } from 'lucide-react';

export default function RoomLobbyPage() {
  const router = useRouter();
  const { setRoom, setRoomStep } = useRoomStore();
  const { user, isAuthenticated } = useAuth();

  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Host creates new room via Go Backend
  const handleCreateRoom = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/room/lobby');
      return;
    }

    setIsLoading(true);
    setError(null);
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
      router.push(`/room/${roomId}`);
    } catch (err: unknown) {
      console.warn('Backend room creation failed:', err);
      setError('Studio online belum dapat membuat room. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Guest joins room with code via Go Backend
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?redirect=/room/lobby');
      return;
    }

    const rawClean = inputCode.trim().toUpperCase();
    if (rawClean.length < 3) {
      setError('Please enter a valid room code.');
      return;
    }
    const cleanCode = rawClean.startsWith('PB-') ? rawClean : `PB-${rawClean}`;

    setIsLoading(true);
    setError(null);
    try {
      const room = await getRoom(cleanCode);
      const code = room.room_code || cleanCode;
      const roomId = code.toLowerCase();

      const role = room.host_user_id === user?.id ? 'host' : 'guest';

      setRoom(roomId, code, role);
      setRoomStep('WAITING');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`room_role_${roomId}`, 'guest');
        sessionStorage.setItem(`room_role_${cleanCode}`, 'guest');
      }
      router.push(`/room/${roomId}`);
    } catch (err: unknown) {
      console.warn('Backend room validation error:', err);
      setError('Room tidak ditemukan atau telah kedaluwarsa. Pastikan kode room sudah benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 md:px-6 pt-28 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold uppercase tracking-wider shadow-xs mb-3 border border-secondary/20">
            <Users className="w-3.5 h-3.5" /> WebRTC Collaborative Studio
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight">
            Collaborative <span className="italic text-secondary">Duo Room</span>
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Real-time side-by-side photobooth sessions with your companions from anywhere in the world.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1: Create Room (Host) */}
          <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Plus className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary font-bold">
                HOST SESSION
              </span>
              <h2 className="font-serif text-2xl font-bold text-primary mt-1 mb-2">
                Host a New Room
              </h2>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                Start an online session as the Host. You will receive a 6-digit code to share with your companion.
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleCreateRoom}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary text-xs font-extrabold uppercase tracking-[0.14em] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-container active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Studio...</span>
                </>
              ) : (
                <>
                  <span>Generate Room Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Card 2: Join Room (Guest) */}
          <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center mb-4">
                <KeyRound className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary font-bold">
                GUEST ACCESS
              </span>
              <h2 className="font-serif text-2xl font-bold text-primary mt-1 mb-2">
                Join with Room Code
              </h2>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                Have a room code from a friend? Enter it below to join their live studio session.
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                maxLength={10}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. PB-HS7M3Q)"
                className="w-full text-center tracking-[0.25em] font-bold uppercase py-3 px-3 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-secondary-container text-on-secondary-fixed text-xs font-extrabold uppercase tracking-[0.14em] shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary active:scale-[0.98] transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Room...</span>
                  </>
                ) : (
                  <>
                    <span>Join Friend&apos;s Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
