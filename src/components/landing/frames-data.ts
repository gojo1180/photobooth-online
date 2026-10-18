export interface FrameShowcaseItem {
  id: string;
  name: string;
  layout: string;
  tag: string;
  tagBg: string;
  tagText: string;
  description: string;
  assetUrl: string;
  poses: number;
  printSize: string;
  styleVibe: string;
  features: string[];
}

export const SIGNATURE_FRAMES: FrameShowcaseItem[] = [
  {
    id: 'frame_strip_pink_default',
    name: 'Powder Pink Y2K Strip',
    layout: '3-Pose Vertical Strip',
    tag: 'Bestseller',
    tagBg: 'bg-secondary-container',
    tagText: 'text-on-secondary-container',
    description:
      'The iconic retro photostrip format featuring playful Y2K sparkles, "IT GIRL" enamel pin, baby blue heart charm, and vintage editorial date stamp. Fits right into clear phone cases and journal covers.',
    assetUrl: '/frames/y2k_strip_pink.svg',
    poses: 3,
    printSize: '5 × 15 cm Photostrip',
    styleVibe: 'Y2K Scrapbook & Powder Pink',
    features: ['3 stacked candid poses', 'Acid lime enamel pin', 'Masking tape accents', 'Editorial archive footer'],
  },
  {
    id: 'frame_grid_cherry_default',
    name: 'Chocolate Cherry 2×2 Grid',
    layout: 'Square 4-Grid Collage',
    tag: 'Iconic Duo',
    tagBg: 'bg-primary',
    tagText: 'text-on-primary',
    description:
      'High-contrast rich espresso cherry frame with neon lime accents, lightning bolt pin, and official archive stamp. Balanced 2×2 symmetry made specifically for couples, friendships, and double portraits.',
    assetUrl: '/frames/y2k_grid_cherry.svg',
    poses: 4,
    printSize: '10 × 10 cm Square Print',
    styleVibe: 'Cherry Contrast & Neon Bolt',
    features: ['2×2 square symmetry', 'Lightning bolt charm', 'Dark editorial border', 'Approved stamp seal'],
  },
  {
    id: 'frame_polaroid_butter_default',
    name: 'Buttercream Duo Polaroid',
    layout: 'Double Polaroid Postcard',
    tag: 'Warm Vintage',
    tagBg: 'bg-tertiary-fixed',
    tagText: 'text-tertiary',
    description:
      'Sun-drenched pastel buttercream background with twin horizontal frames, washi tape overlays, and cursive "Golden Hour Moments" calligraphy. Plenty of breathing room for physical notes and memories.',
    assetUrl: '/frames/y2k_polaroid_butter.svg',
    poses: 2,
    printSize: '10 × 15 cm Postcard',
    styleVibe: 'Golden Hour & Butter Cream',
    features: ['2 wide cinematic slots', 'Pastel washi tape decals', 'Golden hour calligraphy', 'Generous memo border'],
  },
  {
    id: 'frame_collage_lavender_default',
    name: 'Lavender Pop 6-Slot Collage',
    layout: 'Mini Collage 6-Grid',
    tag: 'Party Edition',
    tagBg: 'bg-[#BEE3F8]',
    tagText: 'text-[#1230c7]',
    description:
      'Full-sheet 6-pose collage with cobalt blue borders, pastel star and heart emblems, and verified NevStudio imprint. Maximize your laughs and candid reactions in a single keepsake sheet.',
    assetUrl: '/frames/y2k_collage_lavender.svg',
    poses: 6,
    printSize: 'Full Keepsake Collage',
    styleVibe: 'Cobalt & Lavender Pop',
    features: ['6 dynamic candid shots', 'Enamel badge pins', 'Verified studio seal', 'Maximum pose variety'],
  },
];
