'use client';

import { useEffect, useCallback } from 'react';
import { useRoomStore } from '@/stores/useRoomStore';
import { playBeep, playShutter } from '@/lib/audio';

interface UseSyncShutterOptions {
  onCapture: () => void;
  onFlash?: () => void;
  duration?: number;
}

export function useSyncShutter({ onCapture, onFlash, duration = 3 }: UseSyncShutterOptions) {
  const {
    dataChannel,
    isCountdownActive,
    countdownSeconds,
    startCountdown,
    setCountdownSeconds,
    stopCountdown,
  } = useRoomStore();

  const handleCountdownTick = useCallback((seconds: number) => {
    let current = seconds;
    startCountdown(current);
    playBeep(880, 0.12);

    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdownSeconds(current);
        playBeep(880, 0.12);
      } else {
        clearInterval(interval);
        stopCountdown();
        playBeep(1760, 0.2); // Final high beep
        playShutter();
        if (onFlash) onFlash();
        onCapture();
      }
    }, 1000);
  }, [startCountdown, setCountdownSeconds, stopCountdown, onCapture, onFlash]);

  // Host sends message to Guest
  const triggerSynchronizedShutter = useCallback(() => {
    const activeSec = duration || 3;
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(
        JSON.stringify({
          type: 'START_COUNTDOWN',
          duration: activeSec,
          delay: activeSec * 1000,
          timestamp: Date.now(),
        })
      );
    }
    // Start local countdown
    handleCountdownTick(activeSec);
  }, [dataChannel, duration, handleCountdownTick]);

  // Listen for incoming data channel messages
  useEffect(() => {
    if (!dataChannel) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'START_COUNTDOWN') {
          const peerDuration = typeof message.duration === 'number' ? message.duration : 3;
          handleCountdownTick(peerDuration);
        }
      } catch (e) {
        console.error('Failed to parse RTCDataChannel message', e);
      }
    };

    dataChannel.addEventListener('message', handleMessage);
    return () => {
      dataChannel.removeEventListener('message', handleMessage);
    };
  }, [dataChannel, handleCountdownTick]);

  return {
    isCountdownActive,
    countdownSeconds,
    triggerSynchronizedShutter,
  };
}
