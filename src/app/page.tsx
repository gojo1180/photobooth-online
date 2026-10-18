'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingHeroBanner } from '@/components/landing/LandingHeroBanner';
import { CaptureModesSection } from '@/components/landing/CaptureModesSection';
import { SignatureFramesSection } from '@/components/landing/SignatureFramesSection';
import { FinalCtaBanner } from '@/components/landing/FinalCtaBanner';
import { useRoomStore } from '@/stores/useRoomStore';
import { useAuth } from '@/hooks/useAuth';
import { createRoom, getRoom } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setRoom, setRoomStep } = useRoomStore();

  const [duoCode, setDuoCode] = useState('');
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [duoPreview, setDuoPreview] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

      setRoom(roomId, code, 'guest');
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-page bg-background font-body-md text-on-surface selection:bg-tertiary-fixed selection:text-tertiary min-h-screen flex flex-col">
        <Navbar />

        <main className="w-full pt-16 md:pt-20 bg-background flex-1">
          <div className="flex flex-col w-full">
            <LandingHeroBanner
              duoPreview={duoPreview}
              setDuoPreview={setDuoPreview}
              scrollToSection={scrollToSection}
            />

            <HowItWorks />

            <CaptureModesSection
              duoCode={duoCode}
              setDuoCode={setDuoCode}
              isJoiningRoom={isJoiningRoom}
              isCreatingRoom={isCreatingRoom}
              roomNotice={roomNotice}
              onJoin={handleJoin}
              onCreateDuo={handleCreateDuo}
            />

            <SignatureFramesSection
              activeFrameIndex={activeFrameIndex}
              setActiveFrameIndex={setActiveFrameIndex}
            />

            <FinalCtaBanner />
          </div>
        </main>

        <Footer hideWave />
      </div>
    </MotionConfig>
  );
}
