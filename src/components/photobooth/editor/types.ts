export const createFallbackPhoto = (label: string, bg: string, text: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><rect width='600' height='800' fill='${encodeURIComponent(bg)}'/><circle cx='300' cy='320' r='110' fill='${encodeURIComponent(text)}' opacity='0.2'/><circle cx='300' cy='290' r='80' fill='${encodeURIComponent(text)}' opacity='0.3'/><ellipse cx='300' cy='560' rx='170' ry='130' fill='${encodeURIComponent(text)}' opacity='0.25'/><text x='300' y='305' font-family='sans-serif' font-size='28' font-weight='800' fill='${encodeURIComponent(text)}' text-anchor='middle'>${encodeURIComponent(label)}</text><text x='300' y='345' font-family='sans-serif' font-size='16' font-weight='600' fill='${encodeURIComponent(text)}' text-anchor='middle' opacity='0.75'>Photobooth Candid</text></svg>`;

export const SAMPLE_FALLBACK_PHOTOS = [
  createFallbackPhoto('Pose #1', '#fef08a', '#2E0F15'),
  createFallbackPhoto('Pose #2', '#fce7f3', '#541b44'),
  createFallbackPhoto('Pose #3', '#d2f17c', '#2E0F15'),
  createFallbackPhoto('Pose #4', '#e0e7ff', '#1230c7'),
  createFallbackPhoto('Pose #5', '#fed7aa', '#7c2d12'),
  createFallbackPhoto('Pose #6', '#fae8ff', '#581c87'),
];

export interface FilterOption {
  key: string;
  name: string;
  subLabel: string;
  icon: string;
  cssClass: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  {
    key: 'natural',
    name: 'Natural Glow',
    subLabel: 'Warm Neutral',
    icon: 'wb_sunny',
    cssClass: 'contrast-[1.05] brightness-[1.02] saturate-[1.05]',
  },
  {
    key: 'bw',
    name: 'Classic Monochrome',
    subLabel: 'Deep Grain',
    icon: 'contrast',
    cssClass: 'grayscale contrast-125',
  },
  {
    key: 'honey',
    name: '90s Warm Grain',
    subLabel: 'Golden Amber',
    icon: 'save_as',
    cssClass: 'sepia-[0.35] brightness-105 contrast-105',
  },
  {
    key: 'dreamy',
    name: 'Blush Velvet',
    subLabel: 'Pastel Haze',
    icon: 'filter_vintage',
    cssClass: 'brightness-110 saturate-90 contrast-95',
  },
];

export interface FrameOption {
  key: string;
  name: string;
  subLabel: string;
  cardBgClass: string;
  wrapBgClass: string;
  swatchOuterClass: string;
  swatchInnerClass: string;
  textColorClass?: string;
}

export const FRAME_OPTIONS: FrameOption[] = [
  {
    key: 'cream',
    name: 'Classic Cream',
    subLabel: 'Warm Linen',
    cardBgClass: 'bg-surface-container-lowest border-2 border-primary',
    wrapBgClass: 'bg-[#FDF9F3]',
    swatchOuterClass: 'bg-surface-container-lowest border border-primary',
    swatchInnerClass: 'bg-secondary-container/20 border border-primary',
    textColorClass: 'text-primary',
  },
  {
    key: 'pink',
    name: 'Powder Pink',
    subLabel: 'Sweet Blush',
    cardBgClass: 'bg-[#FDE2E8] border-2 border-primary',
    wrapBgClass: 'bg-[#FDE2E8]',
    swatchOuterClass: 'bg-[#FDE2E8] border border-primary',
    swatchInnerClass: 'bg-tertiary-fixed border border-primary',
    textColorClass: 'text-primary',
  },
  {
    key: 'butter',
    name: 'Butter Yellow',
    subLabel: 'Retro Sun',
    cardBgClass: 'bg-[#FEF08A] border-2 border-primary',
    wrapBgClass: 'bg-[#FEF08A]',
    swatchOuterClass: 'bg-[#FEF08A] border border-primary',
    swatchInnerClass: 'bg-[#FDE2E8] border border-primary',
    textColorClass: 'text-on-surface',
  },
  {
    key: 'cherry',
    name: 'Dark Cherry',
    subLabel: 'Editorial Noir',
    cardBgClass: 'bg-[#24131d] border-2 border-secondary-container text-[#FDF9F3]',
    wrapBgClass: 'bg-[#24131d]',
    swatchOuterClass: 'bg-[#24131d] border border-secondary-container',
    swatchInnerClass: 'bg-secondary-container',
    textColorClass: 'text-[#FDF9F3]',
  },
];
