'use client';

import { useState, useEffect } from 'react';
import { usePhotoboothStore } from '@/stores/usePhotoboothStore';
import { Footer } from '@/components/common/Footer';
import { getLayouts } from '@/lib/api';
import { FORMATS, type FormatCardItem } from './layout/types';
import { LayoutHeroBanner } from './layout/LayoutHeroBanner';
import { LayoutCatalogGrid } from './layout/LayoutCatalogGrid';
import { LayoutTimingPreferences } from './layout/LayoutTimingPreferences';
import { LayoutSessionTips } from './layout/LayoutSessionTips';
import { LayoutActionDock } from './layout/LayoutActionDock';

export function LayoutSelector() {
  const {
    selectedLayoutId,
    selectLayout,
    countdownSeconds,
    setCountdownSeconds,
    soundEnabled,
    setSoundEnabled,
    setStep,
  } = usePhotoboothStore();

  const [formats, setFormats] = useState<FormatCardItem[]>(FORMATS);

  // Find initial active format (default to square/layout_4_grid)
  const initialFormat =
    FORMATS.find((f) => f.id === selectedLayoutId) || FORMATS[1];

  const [selectedFormat, setSelectedFormat] = useState<FormatCardItem>(initialFormat);
  const [timerSeconds, setTimerSeconds] = useState<number>(countdownSeconds || 5);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(soundEnabled);

  // Synchronize layouts live with Go Backend API
  useEffect(() => {
    async function syncBackendLayouts() {
      try {
        const backendData = await getLayouts();
        if (backendData && backendData.length > 0) {
          const merged: FormatCardItem[] = backendData.map((bl) => {
            const fallback = FORMATS.find((f) => f.id === bl.id);
            if (fallback) {
              return {
                ...fallback,
                name: bl.name || fallback.name,
                poses: bl.photo_count || fallback.poses,
              };
            }
            return {
              id: bl.id,
              key: bl.id,
              name: bl.name,
              poses: bl.photo_count,
              formatType:
                bl.photo_count <= 2
                  ? 'postcard'
                  : bl.photo_count === 3
                    ? 'strip'
                    : bl.photo_count === 4
                      ? 'square'
                      : 'collage',
              sizeLabel: `${Math.round(bl.canvas_width / 100)} x ${Math.round(bl.canvas_height / 100)} cm`,
              sizeIcon: 'grid_view',
              description: `High-resolution ${bl.photo_count}-pose archival canvas format.`,
              dockIcon: 'view_stream',
              assetUrl: '/frames/y2k_grid_cherry.svg',
              previewAlt: bl.name,
              tag: 'STUDIO',
            };
          });

          setFormats(merged);
          setSelectedFormat((current) =>
            merged.find((format) => format.id === current.id) || merged[0]
          );
        }
      } catch (err) {
        console.warn('Could not load layouts from backend API, using local definitions:', err);
      }
    }

    syncBackendLayouts();
  }, []);

  const handleProceed = () => {
    selectLayout(selectedFormat.id, selectedFormat.poses);
    setCountdownSeconds(timerSeconds);
    setSoundEnabled(isSoundOn);
    setStep('CAPTURE');
  };

  return (
    <div className="w-full bg-background font-body-md text-on-surface">
      <LayoutHeroBanner />

      <LayoutCatalogGrid
        formats={formats}
        selectedFormatId={selectedFormat.id}
        onSelectFormat={(format) => setSelectedFormat(format)}
      />

      <LayoutTimingPreferences
        timerSeconds={timerSeconds}
        setTimerSeconds={setTimerSeconds}
        isSoundOn={isSoundOn}
        setIsSoundOn={setIsSoundOn}
      />

      <LayoutSessionTips timerSeconds={timerSeconds} />

      <LayoutActionDock
        selectedFormat={selectedFormat}
        timerSeconds={timerSeconds}
        onProceed={handleProceed}
      />

      <Footer />
    </div>
  );
}
