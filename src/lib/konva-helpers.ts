/**
 * Konva & Canvas Composite Utilities for Photobooth
 * Implements slot math, cover-cropping, side-by-side 50/50 online collaboration render
 */

export interface FrameSlot {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropDimensions {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

/**
 * Calculates source cropping coordinates to achieve an "object-fit: cover"
 * inside target slot dimensions (targetW, targetH).
 */
export function calculateCoverCrop(
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number
): CropDimensions {
  const sourceRatio = sourceW / sourceH;
  const targetRatio = targetW / targetH;

  let sWidth = sourceW;
  let sHeight = sourceH;
  let sx = 0;
  let sy = 0;

  if (sourceRatio > targetRatio) {
    // Source is wider than target: crop horizontally
    sWidth = sourceH * targetRatio;
    sx = (sourceW - sWidth) / 2;
  } else {
    // Source is taller than target: crop vertically
    sHeight = sourceW / targetRatio;
    sy = (sourceH - sHeight) / 2;
  }

  return { sx, sy, sWidth, sHeight };
}

/**
 * Side-by-Side partition coordinates for collaborative 2-player photobooth
 * Host takes the left 50%, Guest takes the right 50%
 */
export function getSideBySidePartitions(slot: FrameSlot) {
  const halfWidth = slot.width / 2;

  const hostArea = {
    x: slot.x,
    y: slot.y,
    width: halfWidth,
    height: slot.height,
  };

  const guestArea = {
    x: slot.x + halfWidth,
    y: slot.y,
    width: halfWidth,
    height: slot.height,
  };

  return { hostArea, guestArea };
}

/**
 * Color Filter Presets for Scribblepie Studio aesthetic
 */
export const PHOTO_FILTERS: Record<
  string,
  { label: string; subLabel: string; icon: string; cssFilter: string; description: string }
> = {
  natural: {
    label: 'Alami Asli',
    subLabel: 'Warm Neutral',
    icon: 'wb_sunny',
    cssFilter: 'contrast(105%) brightness(102%) saturate(105%)',
    description: 'Pencahayaan natural hangat studio',
  },
  bw: {
    label: 'B & W Klasik',
    subLabel: 'Deep Grain',
    icon: 'contrast',
    cssFilter: 'grayscale(100%) contrast(125%)',
    description: 'Hitam putih monokrom kontras tinggi',
  },
  honey: {
    label: 'Warm Honey',
    subLabel: 'Golden Glow',
    icon: 'save_as',
    cssFilter: 'sepia(35%) brightness(105%) contrast(105%)',
    description: 'Nuansa madu keemasan bernostalgia',
  },
  dreamy: {
    label: 'Soft Dreamy',
    subLabel: 'Pastel Haze',
    icon: 'filter_vintage',
    cssFilter: 'brightness(110%) saturate(90%) contrast(95%)',
    description: 'Efek lembut kabut pastel estetik',
  },
};

