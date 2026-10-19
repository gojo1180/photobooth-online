import type { BackendLayout } from '@/lib/api';

export interface LayoutItem extends BackendLayout {
  description?: string;
}

export const FALLBACK_LAYOUTS: LayoutItem[] = [
  {
    id: 'layout_3_strip',
    name: 'Classic 3-Strip',
    photo_count: 3,
    canvas_width: 480,
    canvas_height: 1400,
    aspect_ratio: '1:3',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Mall photobooth vertical film strip with header & footer stamps',
  },
  {
    id: 'layout_4_grid',
    name: 'Editorial 2x2 Grid',
    photo_count: 4,
    canvas_width: 800,
    canvas_height: 960,
    aspect_ratio: '1:1',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Four-quadrant magazine grid with center sticker pin seal',
  },
  {
    id: 'layout_2_polaroid',
    name: 'Duo Polaroid Postcard',
    photo_count: 2,
    canvas_width: 600,
    canvas_height: 900,
    aspect_ratio: '2:3',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Two wide cinematic frames with aesthetic margins for dates and notes',
  },
  {
    id: 'layout_6_collage',
    name: 'Mini Collage (6 Pose)',
    photo_count: 6,
    canvas_width: 800,
    canvas_height: 1150,
    aspect_ratio: '2:3',
    is_active: true,
    created_at: new Date().toISOString(),
    description: 'Compact 6-quadrant collage for friends and party shoots',
  },
];

export function getLayoutDimensionsByPoseCount(count: number): {
  canvas_width: number;
  canvas_height: number;
  aspect_ratio: string;
  default_name: string;
  default_id: string;
} {
  switch (count) {
    case 1:
      return {
        canvas_width: 800,
        canvas_height: 1200,
        aspect_ratio: '2:3',
        default_name: 'Single Portrait (1 Pose)',
        default_id: 'layout_1_portrait',
      };
    case 2:
      return {
        canvas_width: 800,
        canvas_height: 1200,
        aspect_ratio: '2:3',
        default_name: 'Postcard Duo (2 Pose)',
        default_id: 'layout_2_polaroid',
      };
    case 3:
      return {
        canvas_width: 600,
        canvas_height: 1800,
        aspect_ratio: '1:3',
        default_name: 'Classic Photostrip (3 Pose)',
        default_id: 'layout_3_strip',
      };
    case 4:
      return {
        canvas_width: 1200,
        canvas_height: 1200,
        aspect_ratio: '1:1',
        default_name: 'Square Grid 2x2 (4 Pose)',
        default_id: 'layout_4_grid',
      };
    case 6:
      return {
        canvas_width: 800,
        canvas_height: 1150,
        aspect_ratio: '2:3',
        default_name: 'Mini Collage (6 Pose)',
        default_id: 'layout_6_collage',
      };
    case 8:
      return {
        canvas_width: 1200,
        canvas_height: 1600,
        aspect_ratio: '3:4',
        default_name: 'Grid Collage (8 Pose)',
        default_id: 'layout_8_grid',
      };
    default:
      if (count % 2 === 1) {
        return {
          canvas_width: 600,
          canvas_height: 600 * count,
          aspect_ratio: `1:${count}`,
          default_name: `Photostrip (${count} Pose)`,
          default_id: `layout_${count}_strip`,
        };
      }
      const rows = count / 2;
      return {
        canvas_width: 800,
        canvas_height: 400 * rows,
        aspect_ratio: `2:${rows}`,
        default_name: `Grid Collage (${count} Pose)`,
        default_id: `layout_${count}_grid`,
      };
  }
}

export function calculateAspectRatioString(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);

  if (w > 20 || h > 20) {
    const ratio = width / height;
    if (Math.abs(ratio - 1 / 3) < 0.05) return '1:3';
    if (Math.abs(ratio - 2 / 3) < 0.05) return '2:3';
    if (Math.abs(ratio - 3 / 4) < 0.05) return '3:4';
    if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16';
    if (Math.abs(ratio - 1) < 0.05) return '1:1';
    if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3';
    if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9';
    return `${Math.round((width / height) * 10) / 10}:1`;
  }
  return `${w}:${h}`;
}
