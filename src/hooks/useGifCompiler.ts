'use client';

import { useState, useCallback } from 'react';

export function useGifCompiler() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compileGif = useCallback(
    async (
      imageUrls: string[],
      options: { delay?: number; width?: number; height?: number } = {}
    ): Promise<string | null> => {
      if (typeof window === 'undefined' || imageUrls.length === 0) return null;

      setIsCompiling(true);
      setProgress(0);
      setError(null);

      try {
        // Dynamically import GIF to prevent SSR issues
        const GIF = (await import('gif.js')).default;

        // Load all images first to extract natural dimensions
        const loadedImages = await Promise.all(
          imageUrls.map(
            (src) =>
              new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(err);
                img.src = src;
              })
          )
        );

        const width = options.width || loadedImages[0].naturalWidth || 600;
        const height = options.height || loadedImages[0].naturalHeight || 800;
        const frameDelay = options.delay || 600; // 600ms per pose

        const gif = new GIF({
          workers: 2,
          quality: 10,
          workerScript: '/workers/gif.worker.js',
          width,
          height,
        });

        // Add each frame onto an offscreen canvas to guarantee uniform size & color
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        for (const img of loadedImages) {
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            gif.addFrame(ctx, { copy: true, delay: frameDelay });
          }
        }

        return await new Promise<string>((resolve, reject) => {
          gif.on('progress', (p: number) => {
            setProgress(Math.round(p * 100));
          });

          gif.on('finished', (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            setGifUrl(url);
            setIsCompiling(false);
            setProgress(100);
            resolve(url);
          });

          gif.on('abort', () => {
            setIsCompiling(false);
            reject(new Error('GIF compilation was cancelled.'));
          });

          gif.render();
        });
      } catch (err: unknown) {
        console.error('GIF compilation error:', err);
        const msg = err instanceof Error ? err.message : 'Failed to compile animated GIF.';
        setError(msg);
        setIsCompiling(false);
        return null;
      }
    },
    []
  );

  const resetGif = useCallback(() => {
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
    }
    setGifUrl(null);
    setProgress(0);
    setIsCompiling(false);
    setError(null);
  }, [gifUrl]);

  return {
    compileGif,
    resetGif,
    isCompiling,
    progress,
    gifUrl,
    error,
  };
}
