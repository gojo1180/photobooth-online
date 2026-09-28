'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { type FrameItem } from '@/stores/usePhotoboothStore';
import { PHOTO_FILTERS, calculateCoverCrop } from '@/lib/konva-helpers';

export interface CanvasStageRef {
  exportHighResPng: () => string | null;
}

interface CanvasStageProps {
  frame: FrameItem | null;
  photos: string[];
  filterKey: string;
}

// Artisanal SVG fallback photos if no camera snapshots captured yet
const createFallbackPhoto = (label: string, bg: string, text: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='600' height='800' fill='${encodeURIComponent(bg)}'/><circle cx='300' cy='320' r='110' fill='${encodeURIComponent(text)}' opacity='0.2'/><circle cx='300' cy='290' r='80' fill='${encodeURIComponent(text)}' opacity='0.3'/><ellipse cx='300' cy='560' rx='170' ry='130' fill='${encodeURIComponent(text)}' opacity='0.25'/><text x='300' y='305' font-family='sans-serif' font-size='28' font-weight='800' fill='${encodeURIComponent(text)}' text-anchor='middle'>${encodeURIComponent(label)}</text><text x='300' y='345' font-family='sans-serif' font-size='16' font-weight='600' fill='${encodeURIComponent(text)}' text-anchor='middle' opacity='0.75'>Photobooth Candid</text></svg>`;

const CANVAS_FALLBACK_PHOTOS = [
  createFallbackPhoto('Pose #1', '#fef08a', '#2E0F15'),
  createFallbackPhoto('Pose #2', '#fce7f3', '#541b44'),
  createFallbackPhoto('Pose #3', '#d2f17c', '#2E0F15'),
  createFallbackPhoto('Pose #4', '#e0e7ff', '#1230c7'),
  createFallbackPhoto('Pose #5', '#fed7aa', '#7c2d12'),
  createFallbackPhoto('Pose #6', '#fae8ff', '#581c87'),
];

export const CanvasStage = forwardRef<CanvasStageRef, CanvasStageProps>(
  ({ frame, photos, filterKey }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isRendering, setIsRendering] = useState(false);

    // Provide imperative export method
    useImperativeHandle(ref, () => ({
      exportHighResPng: () => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png', 1.0);
      },
    }));

    useEffect(() => {
      if (!canvasRef.current || !frame) return;

      let isCancelled = false;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsRendering(true);

      const width = frame.canvasWidth || 600;
      const height = frame.canvasHeight || 900;
      canvas.width = width;
      canvas.height = height;

      // Draw neutral background: Cream Linen
      ctx.fillStyle = '#FDF9F3';
      ctx.fillRect(0, 0, width, height);

      // 1. Load frame overlay image
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';

      // 2. Load all captured photos (use fallback sample poses if photo is not yet captured)
      const photoPromises = frame.slots.map((slot, idx) => {
        const photoSrc =
          photos[idx] || CANVAS_FALLBACK_PHOTOS[idx % CANVAS_FALLBACK_PHOTOS.length];
        if (!photoSrc) return Promise.resolve(null);

        return new Promise<{ img: HTMLImageElement; slot: typeof slot } | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ img, slot });
          img.onerror = () => resolve(null);
          img.src = photoSrc;
        });
      });

      Promise.all([
        new Promise<HTMLImageElement | null>((resolve) => {
          frameImg.onload = () => resolve(frameImg);
          frameImg.onerror = () => resolve(null);
          frameImg.src = frame.asset_url;
        }),
        ...photoPromises,
      ]).then(([loadedFrame, ...loadedPhotos]) => {
        if (isCancelled) return;

        // Auto-heal / normalize slot coordinates if saved against different resolution
        let effectiveSlots = frame.slots;
        if (loadedFrame && loadedFrame.naturalWidth > 0 && loadedFrame.naturalHeight > 0) {
          const maxSlotX = Math.max(...frame.slots.map((s) => s.x + s.width), 0);
          const maxSlotY = Math.max(...frame.slots.map((s) => s.y + s.height), 0);

          if (maxSlotX > width || maxSlotY > height) {
            // Slots were saved in natural image resolution (e.g. 1200x1800) -> scale to canvas
            const sx = width / loadedFrame.naturalWidth;
            const sy = height / loadedFrame.naturalHeight;
            effectiveSlots = frame.slots.map((s) => ({
              ...s,
              x: Math.round(s.x * sx),
              y: Math.round(s.y * sy),
              width: Math.round(s.width * sx),
              height: Math.round(s.height * sy),
            }));
          } else if (
            maxSlotX > 0 &&
            maxSlotY > 0 &&
            maxSlotX < width * 0.65 &&
            maxSlotY < height * 0.65 &&
            maxSlotX <= 400 &&
            maxSlotY <= 600
          ) {
            // Slots were saved in unscaled admin preview coordinates (~387x580)
            const previewH = 580;
            const previewW = (loadedFrame.naturalWidth / loadedFrame.naturalHeight) * previewH;
            const sx = width / previewW;
            const sy = height / previewH;
            effectiveSlots = frame.slots.map((s) => ({
              ...s,
              x: Math.round(s.x * sx),
              y: Math.round(s.y * sy),
              width: Math.round(s.width * sx),
              height: Math.round(s.height * sy),
            }));
          }
        }

        // Apply active filter to photos
        const filterConfig = PHOTO_FILTERS[filterKey] || PHOTO_FILTERS.normal;
        ctx.filter = filterConfig.cssFilter;

        // Draw each photo into its corresponding slot with cover crop
        loadedPhotos.forEach((item, idx) => {
          if (!item) return;
          const { img } = item;
          const slot = effectiveSlots[idx] || item.slot;

          const crop = calculateCoverCrop(
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            slot.width,
            slot.height
          );

          ctx.drawImage(
            img,
            crop.sx,
            crop.sy,
            crop.sWidth,
            crop.sHeight,
            slot.x,
            slot.y,
            slot.width,
            slot.height
          );
        });

        // Reset filter before drawing frame overlay
        ctx.filter = 'none';

        // Draw frame overlay PNG/SVG on top with slot punch-out (destination-out mask)
        // This guarantees that any opaque white/cream boxes in user-uploaded templates
        // are punched out so the photos underneath shine through!
        if (loadedFrame) {
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = width;
          frameCanvas.height = height;
          const fCtx = frameCanvas.getContext('2d');
          if (fCtx) {
            fCtx.drawImage(loadedFrame, 0, 0, width, height);

            // Punch out slot rectangles from the frame overlay
            fCtx.globalCompositeOperation = 'destination-out';
            effectiveSlots.forEach((slot) => {
              fCtx.fillRect(slot.x, slot.y, slot.width, slot.height);
            });
            fCtx.globalCompositeOperation = 'source-over';

            // Composite punched frame overlay on top of the rendered photos
            ctx.drawImage(frameCanvas, 0, 0, width, height);
          } else {
            ctx.drawImage(loadedFrame, 0, 0, width, height);
          }
        }

        setIsRendering(false);
      });

      return () => {
        isCancelled = true;
      };
    }, [frame, photos, filterKey]);

    if (!frame) {
      return (
        <div className="w-full h-96 flex items-center justify-center bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-2xl">
          <p className="text-sm font-medium text-on-surface-variant font-[var(--font-jakarta)]">Select a frame template to preview your print</p>
        </div>
      );
    }

    return (
      <div className="relative flex justify-center items-center w-full max-w-full overflow-hidden p-2">
        <canvas
          ref={canvasRef}
          className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl border border-outline-variant/30 shadow-lg bg-white"
        />
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xs rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary animate-pulse font-[var(--font-space-grotesk)]">
              Rendering Composite...
            </span>
          </div>
        )}
      </div>
    );
  }
);

CanvasStage.displayName = 'CanvasStage';
