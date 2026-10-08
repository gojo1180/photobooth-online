'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera is not supported on this browser.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsReady(true);
        setError(null);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to access webcam. Please check permissions.';
        setError(msg);
        setIsReady(false);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, requestVersion]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, [stream]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setIsMirrored((prev) => !prev);
  }, []);

  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  const retryCamera = useCallback(() => {
    setError(null);
    setIsReady(false);
    setRequestVersion((version) => version + 1);
  }, []);

  // Capture current video frame to base64 JPEG
  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !isReady) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isReady, isMirrored]);

  return {
    videoRef,
    stream,
    isReady,
    error,
    isMirrored,
    facingMode,
    stopCamera,
    toggleFacingMode,
    toggleMirror,
    retryCamera,
    captureSnapshot,
  };
}

/**
 * PRD 5.4 Protocol Helper: Global stop for all active webcam streams & hardware indicators
 */
export function stopAllMediaStreams() {
  if (typeof window !== 'undefined') {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      const srcObject = video.srcObject as MediaStream | null;
      if (srcObject && typeof srcObject.getTracks === 'function') {
        srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    });
  }
}
