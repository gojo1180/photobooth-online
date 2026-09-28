import { create } from 'zustand';

export type WizardStep = 'SELECT_LAYOUT' | 'CAPTURE' | 'CUSTOMIZE' | 'EXPORT';

export interface FrameSlot {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameItem {
  id: string;
  layout_id: string;
  name: string;
  asset_url: string;
  slots: FrameSlot[];
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface PhotoboothStore {
  step: WizardStep;
  selectedLayoutId: string | null;
  expectedPhotoCount: number;
  countdownSeconds: number;
  soundEnabled: boolean;
  capturedPhotos: string[]; // Ephemeral base64/blob strings in browser memory
  selectedFrame: FrameItem | null;
  activeFilter: string;
  isCapturing: boolean;
  cardCaption: string;
  showDateStamp: boolean;
  dateStampText: string;
  frameThemeKey: string;

  // Actions
  setStep: (step: WizardStep) => void;
  selectLayout: (layoutId: string, count: number) => void;
  setCountdownSeconds: (seconds: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  pushCapturedPhoto: (base64: string) => void;
  replacePhotoAtIndex: (index: number, base64: string) => void;
  selectFrame: (frame: FrameItem | null) => void;
  setActiveFilter: (filter: string) => void;
  setIsCapturing: (isCapturing: boolean) => void;
  setCardCaption: (caption: string) => void;
  setShowDateStamp: (show: boolean) => void;
  setDateStampText: (text: string) => void;
  setFrameThemeKey: (key: string) => void;
  resetSession: () => void;
}

export const usePhotoboothStore = create<PhotoboothStore>((set) => ({
  step: 'SELECT_LAYOUT',
  selectedLayoutId: 'layout_4_grid',
  expectedPhotoCount: 4,
  countdownSeconds: 3,
  soundEnabled: true,
  capturedPhotos: [],
  selectedFrame: null,
  activeFilter: 'natural',
  isCapturing: false,
  cardCaption: 'Memories with Bestie',
  showDateStamp: true,
  dateStampText: 'Scribblepie Studio • Oct 24, 2025',
  frameThemeKey: 'gold-cobalt',

  setStep: (step) => set({ step }),

  selectLayout: (layoutId, count) =>
    set({
      selectedLayoutId: layoutId,
      expectedPhotoCount: count,
      capturedPhotos: [],
      selectedFrame: null,
    }),

  setCountdownSeconds: (countdownSeconds) => set({ countdownSeconds }),

  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

  pushCapturedPhoto: (base64) =>
    set((state) => ({
      capturedPhotos: [...state.capturedPhotos, base64],
    })),

  replacePhotoAtIndex: (index, base64) =>
    set((state) => {
      const updated = [...state.capturedPhotos];
      updated[index] = base64;
      return { capturedPhotos: updated };
    }),

  selectFrame: (frame) => set({ selectedFrame: frame }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setIsCapturing: (isCapturing) => set({ isCapturing }),

  setCardCaption: (cardCaption) => set({ cardCaption }),

  setShowDateStamp: (showDateStamp) => set({ showDateStamp }),

  setDateStampText: (dateStampText) => set({ dateStampText }),

  setFrameThemeKey: (frameThemeKey) => set({ frameThemeKey }),

  resetSession: () =>
    set({
      step: 'SELECT_LAYOUT',
      selectedLayoutId: 'layout_4_grid',
      expectedPhotoCount: 4,
      countdownSeconds: 3,
      soundEnabled: true,
      capturedPhotos: [],
      selectedFrame: null,
      activeFilter: 'natural',
      isCapturing: false,
      cardCaption: 'Memories with Bestie',
      showDateStamp: true,
      dateStampText: 'Scribblepie Studio • Oct 24, 2025',
      frameThemeKey: 'gold-cobalt',
    }),
}));
