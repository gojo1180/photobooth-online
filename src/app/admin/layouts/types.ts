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
