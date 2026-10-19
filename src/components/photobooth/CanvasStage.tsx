'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { usePhotoboothStore, type FrameItem } from '@/stores/usePhotoboothStore';
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

const FRAME_THEMES: Record<string, { background: string; foreground: string; accent: string }> = {
  cream: { background: '#FDF9F3', foreground: '#001C97', accent: '#895100' },
  pink: { background: '#FDE2E8', foreground: '#001C97', accent: '#6E315A' },
  butter: { background: '#FEF08A', foreground: '#1C1C18', accent: '#895100' },
  cherry: { background: '#24131D', foreground: '#FDF9F3', accent: '#FFB86D' },
};

function fitCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  preferredSize: number,
  fontFamily: string
) {
  let fontSize = preferredSize;
  do {
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fontSize -= 1;
  } while (fontSize > 12);
}

export const CanvasStage = forwardRef<CanvasStageRef, CanvasStageProps>(
  ({ frame, photos, filterKey }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const { cardCaption, showDateStamp, dateStampText, frameThemeKey } = usePhotoboothStore();

    // Provide imperative export method
    useImperativeHandle(ref, () => ({
      exportHighResPng: () => {
        if (!canvasRef.current || isRendering || !frame || photos.length < frame.slots.length) {
          return null;
        }
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

      const theme = FRAME_THEMES[frameThemeKey] || FRAME_THEMES.cream;

      // Draw the selected matte color as the physical print background.
      ctx.fillStyle = theme.background;
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

        // Dynamically match canvas dimensions to the uploaded frame's natural resolution & aspect ratio
        const width =
          loadedFrame && loadedFrame.naturalWidth > 0
            ? loadedFrame.naturalWidth
            : (frame.canvasWidth || 600);
        const height =
          loadedFrame && loadedFrame.naturalHeight > 0
            ? loadedFrame.naturalHeight
            : (frame.canvasHeight || 900);

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        // Draw physical matte print background matching the frame's exact dimensions
        ctx.fillStyle = theme.background;
        ctx.fillRect(0, 0, width, height);

        // Normalize slot coordinates to active canvas resolution
        let effectiveSlots = frame.slots;
        if (loadedFrame && loadedFrame.naturalWidth > 0 && loadedFrame.naturalHeight > 0) {
          const maxSlotX = Math.max(...frame.slots.map((s) => s.x + s.width), 0);
          const maxSlotY = Math.max(...frame.slots.map((s) => s.y + s.height), 0);

          // If slots were authored in a different coordinate space (e.g. legacy fixed canvas),
          // determine authoring width/height and scale smoothly to the current frame dimensions:
          const authoringW =
            frame.canvasWidth && frame.canvasWidth !== width && maxSlotX <= frame.canvasWidth
              ? frame.canvasWidth
              : maxSlotX > width
              ? maxSlotX
              : width;
          const authoringH =
            frame.canvasHeight && frame.canvasHeight !== height && maxSlotY <= frame.canvasHeight
              ? frame.canvasHeight
              : maxSlotY > height
              ? maxSlotY
              : height;

          if (authoringW !== width || authoringH !== height) {
            const sx = width / authoringW;
            const sy = height / authoringH;
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

        // Draw each photo into its corresponding slot with cover crop & 2px bleed under frame border
        const BLEED_PX = 2;
        loadedPhotos.forEach((item, idx) => {
          if (!item) return;
          const { img } = item;
          const slot = effectiveSlots[idx] || item.slot;

          const bleedX = Math.max(0, slot.x - BLEED_PX);
          const bleedY = Math.max(0, slot.y - BLEED_PX);
          const bleedW = Math.min(width - bleedX, slot.width + BLEED_PX * 2);
          const bleedH = Math.min(height - bleedY, slot.height + BLEED_PX * 2);

          const crop = calculateCoverCrop(
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            bleedW,
            bleedH
          );

          ctx.drawImage(
            img,
            crop.sx,
            crop.sy,
            crop.sWidth,
            crop.sHeight,
            bleedX,
            bleedY,
            bleedW,
            bleedH
          );
        });

        // Reset filter before drawing frame overlay
        ctx.filter = 'none';

        // Draw frame overlay PNG/SVG directly on top of photos
        // Transparent punched green-screen holes allow photos to show through,
        // while stickers, decorative elements, and borders overlay naturally!
        if (loadedFrame) {
          ctx.drawImage(loadedFrame, 0, 0, width, height);
        }

        // Optional personalized print footer (rendered only if custom caption or date stamp is active)
        const hasCustomCaption = Boolean(cardCaption && cardCaption.trim().length > 0);
        if (hasCustomCaption || (showDateStamp && dateStampText)) {
          const maxSlotBottom = Math.max(...effectiveSlots.map((slot) => slot.y + slot.height), 0);
          const footerTop = Math.min(height - 72, maxSlotBottom + Math.max(10, height * 0.012));
          const footerHeight = height - footerTop;

          if (footerHeight >= 40) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (hasCustomCaption) {
              ctx.fillStyle = theme.foreground;
              fitCanvasText(
                ctx,
                cardCaption.trim(),
                width * 0.86,
                Math.max(18, Math.min(34, width * 0.042)),
                'Vollkorn, Georgia, serif'
              );
              ctx.fillText(
                cardCaption.trim(),
                width / 2,
                footerTop + footerHeight * (showDateStamp ? 0.38 : 0.53)
              );
            }

            if (showDateStamp && dateStampText) {
              ctx.fillStyle = theme.accent;
              fitCanvasText(
                ctx,
                dateStampText.toUpperCase(),
                width * 0.78,
                Math.max(11, Math.min(16, width * 0.022)),
                '"Plus Jakarta Sans", Arial, sans-serif'
              );
              ctx.fillText(dateStampText.toUpperCase(), width / 2, footerTop + footerHeight * 0.72);
            }
          }
        }

        setIsRendering(false);
      });

      return () => {
        isCancelled = true;
      };
    }, [cardCaption, dateStampText, filterKey, frame, frameThemeKey, photos, showDateStamp]);

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
