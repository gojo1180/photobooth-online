export interface FormatCardItem {
  id: string; // matches backend layout id
  key: string;
  name: string;
  poses: number;
  formatType: 'strip' | 'square' | 'postcard' | 'collage';
  sizeLabel: string;
  sizeIcon: string;
  description: string;
  dockIcon: string;
  assetUrl: string;
  previewAlt: string;
  tag?: string;
  tagColor?: string;
}

export const FORMATS: FormatCardItem[] = [
  {
    id: 'layout_3_strip',
    key: 'strip',
    name: 'Classic Photostrip (3 Poses)',
    poses: 3,
    formatType: 'strip',
    sizeLabel: '5 x 15 cm Photostrip',
    sizeIcon: 'history_edu',
    description: 'Nostalgic vertical photostrip that slides effortlessly into phone cases, book corners, and keepsake envelopes.',
    dockIcon: 'view_stream',
    assetUrl: '/frames/y2k_strip_pink.svg',
    previewAlt: 'Classic Y2K 3-Pose Photostrip Frame',
    tag: 'ICONIC',
  },
  {
    id: 'layout_4_grid',
    key: 'square',
    name: 'Square Polaroid Grid (4 Poses - 2x2)',
    poses: 4,
    formatType: 'square',
    sizeLabel: '10 x 10 cm Symmetrical',
    sizeIcon: 'crop_square',
    description: 'The most balanced 2x2 layout. Offers generous space for joyful group shots, duo portraits, and spontaneous expressions.',
    dockIcon: 'grid_view',
    assetUrl: '/frames/y2k_grid_cherry.svg',
    previewAlt: 'Chocolate Cherry 2x2 Grid Frame',
    tag: 'MOST POPULAR',
  },
  {
    id: 'layout_2_polaroid',
    key: 'postcard',
    name: 'Postcard Duo (2 Poses)',
    poses: 2,
    formatType: 'postcard',
    sizeLabel: '10 x 15 cm Postcard',
    sizeIcon: 'view_agenda',
    description: 'Two wide cinematic frames with aesthetic margins for handwritten dates, anniversary notes, or sweet messages.',
    dockIcon: 'view_agenda',
    assetUrl: '/frames/y2k_polaroid_butter.svg',
    previewAlt: 'Buttercream Duo Polaroid Frame',
  },
  {
    id: 'layout_6_collage',
    key: 'collage',
    name: 'Mini Collage (6 Poses)',
    poses: 6,
    formatType: 'collage',
    sizeLabel: 'Mini 6-Grid Collage',
    sizeIcon: 'grid_view',
    description: 'Enjoy 6 candid reactions packed into a single keepsake sheet full of laughter, lively energy, and playful details.',
    dockIcon: 'dashboard',
    assetUrl: '/frames/y2k_collage_lavender.svg',
    previewAlt: 'Lavender Pop 6-Slot Collage Frame',
    tag: 'PARTY EDITION',
  },
];
