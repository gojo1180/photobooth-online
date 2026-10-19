'use client';

import { useState, useEffect } from 'react';
import { getFrames, getLayouts } from '@/lib/api';
import { type FrameItem } from '@/stores/usePhotoboothStore';

// Built-in Y2K Scrapbook default frames for instant offline/dev testing
export const DEFAULT_FRAMES: Record<string, FrameItem[]> = {
  layout_3_strip: [
    {
      id: 'frame_strip_pink_default',
      layout_id: 'layout_3_strip',
      name: 'Powder Pink Y2K Strip',
      asset_url: '/frames/y2k_strip_pink.svg',
      canvasWidth: 600,
      canvasHeight: 1800,
      slots: [
        { index: 0, x: 50, y: 116, width: 500, height: 463 },
        { index: 1, x: 50, y: 617, width: 500, height: 463 },
        { index: 2, x: 50, y: 1119, width: 500, height: 463 },
      ],
    },
  ],
  layout_4_grid: [
    {
      id: 'frame_grid_cherry_default',
      layout_id: 'layout_4_grid',
      name: 'Chocolate Cherry 2x2 Grid',
      asset_url: '/frames/y2k_grid_cherry.svg',
      canvasWidth: 1200,
      canvasHeight: 1200,
      slots: [
        { index: 0, x: 68, y: 125, width: 502, height: 419 },
        { index: 1, x: 630, y: 125, width: 502, height: 419 },
        { index: 2, x: 68, y: 588, width: 502, height: 419 },
        { index: 3, x: 630, y: 588, width: 502, height: 419 },
      ],
    },
  ],
  layout_2_polaroid: [
    {
      id: 'frame_polaroid_butter_default',
      layout_id: 'layout_2_polaroid',
      name: 'Buttercream Duo Polaroid',
      asset_url: '/frames/y2k_polaroid_butter.svg',
      canvasWidth: 800,
      canvasHeight: 1200,
      slots: [
        { index: 0, x: 80, y: 107, width: 640, height: 440 },
        { index: 1, x: 80, y: 600, width: 640, height: 440 },
      ],
    },
  ],
  layout_6_collage: [
    {
      id: 'frame_collage_lavender_default',
      layout_id: 'layout_6_collage',
      name: 'Lavender Pop 6-Slot Collage',
      asset_url: '/frames/y2k_collage_lavender.svg',
      canvasWidth: 800,
      canvasHeight: 1150,
      slots: [
        { index: 0, x: 45, y: 90, width: 335, height: 300 },
        { index: 1, x: 420, y: 90, width: 335, height: 300 },
        { index: 2, x: 45, y: 410, width: 335, height: 300 },
        { index: 3, x: 420, y: 410, width: 335, height: 300 },
        { index: 4, x: 45, y: 730, width: 335, height: 300 },
        { index: 5, x: 420, y: 730, width: 335, height: 300 },
      ],
    },
  ],
};

export function useFrameFilter(selectedLayoutId: string | null) {
  const [frames, setFrames] = useState<FrameItem[]>(() =>
    selectedLayoutId ? DEFAULT_FRAMES[selectedLayoutId] || [] : []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedLayoutId) return;

    let isMounted = true;
    const currentLayoutId = selectedLayoutId;

    async function fetchFrames() {
      setIsLoading(true);
      try {
        const [backendLayouts, backendFrames] = await Promise.all([
          getLayouts().catch(() => []),
          getFrames(currentLayoutId).catch(() => []),
        ]);

        const currentLayout = backendLayouts.find((l) => l.id === currentLayoutId);
        const layoutCanvasW =
          currentLayout?.canvas_width ||
          DEFAULT_FRAMES[currentLayoutId]?.[0]?.canvasWidth ||
          600;
        const layoutCanvasH =
          currentLayout?.canvas_height ||
          DEFAULT_FRAMES[currentLayoutId]?.[0]?.canvasHeight ||
          1800;

        if (!backendFrames || backendFrames.length === 0) {
          // Fallback to built-in curated Y2K templates
          if (isMounted) {
            setFrames(DEFAULT_FRAMES[currentLayoutId] || []);
          }
        } else {
          if (isMounted) {
            // Map backend frames to FrameItem type with dynamic layout canvas dimensions
            const mappedFrames: FrameItem[] = backendFrames.map((bf) => ({
              id: bf.id,
              layout_id: bf.layout_id,
              name: bf.name,
              asset_url: bf.asset_url,
              slots: bf.slots,
              canvasWidth: layoutCanvasW,
              canvasHeight: layoutCanvasH,
            }));
            setFrames(mappedFrames);
          }
        }
      } catch (err) {
        console.warn('Backend frames fetch failed, falling back to local defaults:', err);
        if (isMounted) {
          setFrames(DEFAULT_FRAMES[currentLayoutId] || []);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchFrames();

    return () => {
      isMounted = false;
    };
  }, [selectedLayoutId]);

  return { frames, isLoading };
}
