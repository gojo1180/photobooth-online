export interface RoomLayoutItem {
  id: string;
  name: string;
  poses: number;
  size: string;
  icon: string;
  desc: string;
  assetUrl: string;
  tag?: string;
}

export const DEFAULT_ROOM_LAYOUTS: RoomLayoutItem[] = [
  {
    id: 'layout_4_grid',
    name: 'Square Polaroid Grid (4 Poses)',
    poses: 4,
    size: '10 x 10 cm Symmetrical',
    icon: 'grid_view',
    desc: 'The most balanced 2x2 grid layout. Perfect for dual portraits & fun poses.',
    assetUrl: '/frames/y2k_grid_cherry.svg',
    tag: 'MOST POPULAR',
  },
  {
    id: 'layout_3_strip',
    name: 'Classic Photostrip (3 Poses)',
    poses: 3,
    size: '5 x 15 cm Photostrip',
    icon: 'view_stream',
    desc: 'Timeless vertical strip that fits into phone cases and albums.',
    assetUrl: '/frames/y2k_strip_pink.svg',
    tag: 'ICONIC',
  },
  {
    id: 'layout_2_polaroid',
    name: 'Postcard Duo (2 Poses)',
    poses: 2,
    size: '10 x 15 cm Postcard',
    icon: 'view_agenda',
    desc: 'Wide cinematic frames with generous margins for keepsake notes.',
    assetUrl: '/frames/y2k_polaroid_butter.svg',
  },
  {
    id: 'layout_6_collage',
    name: 'Mini Collage (6 Poses)',
    poses: 6,
    size: 'Mini 6-Grid Collage',
    icon: 'dashboard',
    desc: 'Six lively candid snapshots packed into one celebratory sheet.',
    assetUrl: '/frames/y2k_collage_lavender.svg',
    tag: 'PARTY EDITION',
  },
];
