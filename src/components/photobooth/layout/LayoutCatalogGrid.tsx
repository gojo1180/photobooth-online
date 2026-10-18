'use client';

import type { FormatCardItem } from './types';

interface LayoutCatalogGridProps {
  formats: FormatCardItem[];
  selectedFormatId: string;
  onSelectFormat: (format: FormatCardItem) => void;
}

export function LayoutCatalogGrid({
  formats,
  selectedFormatId,
  onSelectFormat,
}: LayoutCatalogGridProps) {
  return (
    <section className="w-full bg-background pt-space-xl pb-space-xl relative">
      <div className="max-w-7xl mx-auto px-margin">
        <div className="text-center mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
            Studio Layout Options
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-1 font-serif">
            Pick Your Keepsake Dimension
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto mt-2">
            Every format is calibrated to match real photo print dimensions. Click any card to select.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter items-stretch">
          {formats.map((format) => {
            const isSelected = selectedFormatId === format.id;
            return (
              <article
                key={format.id}
                onClick={() => onSelectFormat(format)}
                className={`format-card group cursor-pointer flex flex-col justify-between rounded-xl p-space-sm transition-all duration-300 relative border ${
                  isSelected
                    ? 'selected bg-secondary-fixed text-on-secondary-fixed shadow-md ring-2 ring-primary -translate-y-1 border-primary'
                    : 'bg-surface-container-lowest text-on-surface shadow-sm hover:shadow-md hover:-translate-y-1 border-outline-variant/40 hover:border-primary/40'
                }`}
              >
                {/* Badge Ribbon */}
                {format.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary font-label-sm text-label-sm uppercase px-space-sm py-1 rounded-full shadow-xs flex items-center gap-1 z-30 font-bold tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span>{format.tag}</span>
                  </div>
                )}

                {/* Frame Showcase Container */}
                <div className="relative w-full bg-surface-container-low rounded-lg p-space-xs flex flex-col items-center justify-center shadow-inner mt-2 min-h-[220px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-44 max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    alt={format.previewAlt}
                    src={format.assetUrl}
                  />
                </div>

                {/* Info Block */}
                <div className="flex flex-col flex-grow justify-between mt-space-md text-center">
                  <div>
                    <div className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-1 font-bold">
                      <span className="material-symbols-outlined text-[14px]">{format.sizeIcon}</span>
                      <span>{format.sizeLabel}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-primary leading-snug font-serif">
                      {format.name}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                      {format.description}
                    </p>
                  </div>

                  <div className="mt-space-md pt-space-xs">
                    <button
                      className={`select-btn w-full font-label-md text-label-md uppercase py-2.5 px-space-sm rounded-lg transition-all font-bold cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-xs flex items-center justify-center gap-1'
                          : 'bg-surface-container text-primary hover:bg-primary hover:text-on-primary border border-outline-variant/30'
                      }`}
                      type="button"
                    >
                      {isSelected ? (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>SELECTED FORMAT</span>
                        </>
                      ) : (
                        <span>CHOOSE {format.key.toUpperCase()}</span>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
