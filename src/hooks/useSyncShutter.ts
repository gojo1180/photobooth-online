'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRoomStore } from '@/stores/useRoomStore';
import { playBeep, playShutter } from '@/lib/audio';

interface UseSyncShutterOptions {
  onCapture: () => void;
  onFlash?: () => void;
  duration?: number;
  soundEnabled?: boolean;
  canTrigger?: boolean;
}

export function useSyncShutter({
  onCapture,
  onFlash,
  duration = 3,
  soundEnabled = true,
  canTrigger = true,
}: UseSyncShutterOptions) {
  const {
    dataChannel,
    isCountdownActive,
    countdownSeconds,
    startCountdown,
    setCountdownSeconds,
    stopCountdown,
  } = useRoomStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCaptureIdRef = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  }, []);

  const handleCountdownTick = useCallback((seconds: number, captureAt: number, captureId: string) => {
    if (activeCaptureIdRef.current === captureId) return;

    clearTimers();
    activeCaptureIdRef.current = captureId;

    const safeDuration = Math.max(1, seconds);
    const maxExpectedDelay = safeDuration * 1000 + 2000;
    const rawDelay = captureAt - Date.now();
    const delay = rawDelay > 0 && rawDelay <= maxExpectedDelay ? rawDelay : safeDuration * 1000;
    const effectiveCaptureAt = Date.now() + delay;
    let displayedSecond = Math.max(1, Math.ceil(delay / 1000));

    startCountdown(displayedSecond);
    if (soundEnabled) playBeep(880, 0.12);

    intervalRef.current = setInterval(() => {
      const nextSecond = Math.max(1, Math.ceil((effectiveCaptureAt - Date.now()) / 1000));
      if (nextSecond !== displayedSecond) {
        displayedSecond = nextSecond;
        setCountdownSeconds(nextSecond);
        if (soundEnabled && nextSecond > 0) playBeep(880, 0.12);
      }
    }, 100);

    captureTimeoutRef.current = setTimeout(() => {
      clearTimers();
      stopCountdown();
      if (soundEnabled) {
        playBeep(1760, 0.2);
        playShutter();
      }
      onFlash?.();
      onCapture();
      activeCaptureIdRef.current = null;
    }, delay);
  }, [clearTimers, onCapture, onFlash, setCountdownSeconds, soundEnabled, startCountdown, stopCountdown]);

  // Host sends message to Guest
  const triggerSynchronizedShutter = useCallback(() => {
    if (!canTrigger || isCountdownActive) return;

    const activeSec = duration || 3;
    const captureId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `capture_${Date.now()}`;
    // A small lead gives the peer time to receive the command while both
    // clients still resolve the same wall-clock capture target.
    const captureAt = Date.now() + activeSec * 1000 + 300;

    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(
        JSON.stringify({
          type: 'START_COUNTDOWN',
          captureId,
          duration: activeSec,
          captureAt,
        })
      );
    }
    handleCountdownTick(activeSec, captureAt, captureId);
  }, [canTrigger, dataChannel, duration, handleCountdownTick, isCountdownActive]);

  // Listen for incoming data channel messages
  useEffect(() => {
    if (!dataChannel) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'START_COUNTDOWN') {
          const peerDuration = typeof message.duration === 'number' ? message.duration : 3;
          const peerCaptureAt = typeof message.captureAt === 'number'
            ? message.captureAt
            : Date.now() + peerDuration * 1000;
          const captureId = typeof message.captureId === 'string'
            ? message.captureId
            : `peer_capture_${peerCaptureAt}`;
          handleCountdownTick(peerDuration, peerCaptureAt, captureId);
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

  useEffect(() => () => {
    clearTimers();
    stopCountdown();
  }, [clearTimers, stopCountdown]);

  return {
    isCountdownActive,
    countdownSeconds,
    triggerSynchronizedShutter,
  };
}
