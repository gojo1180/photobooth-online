'use client';

import { useState, useRef } from 'react';
import { type FrameSlot } from '@/stores/usePhotoboothStore';
import { Plus, Trash2, Crosshair } from 'lucide-react';

interface SlotMapperCanvasProps {
  imageSrc: string;
  slots: FrameSlot[];
  onSlotsChange: (slots: FrameSlot[]) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function SlotMapperCanvas({
  imageSrc,
  slots,
  onSlotsChange,
  canvasWidth = 600,
  canvasHeight = 900,
}: SlotMapperCanvasProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgDisplaySize, setImgDisplaySize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setImgDisplaySize({
      width: target.clientWidth,
      height: target.clientHeight,
    });
  };

  const scaleX =
    imgDisplaySize.width > 0 && canvasWidth > 0 ? imgDisplaySize.width / canvasWidth : 1;
  const scaleY =
    imgDisplaySize.height > 0 && canvasHeight > 0 ? imgDisplaySize.height / canvasHeight : 1;

  const handleAddSlot = () => {
    const slotW = Math.round(canvasWidth * 0.8);
    const slotH = Math.round(canvasHeight * 0.35);
    const slotX = Math.round((canvasWidth - slotW) / 2);
    const newSlot: FrameSlot = {
      index: slots.length,
      x: slotX,
      y: 60 + slots.length * (slotH + 40),
      width: slotW,
      height: slotH,
    };
    onSlotsChange([...slots, newSlot]);
    setSelectedSlotIndex(newSlot.index);
  };

  const handleRemoveSlot = (index: number) => {
    const filtered = slots
      .filter((s) => s.index !== index)
      .map((s, idx) => ({ ...s, index: idx }));
    onSlotsChange(filtered);
    setSelectedSlotIndex(null);
  };

  const handleUpdateCoordinate = (
    index: number,
    field: keyof FrameSlot,
    value: number
  ) => {
    const updated = slots.map((s) => {
      if (s.index === index) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onSlotsChange(updated);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Interactive Visual Canvas Area */}
      <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-xs flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="font-serif font-bold text-primary">
              Visual Slot Overlay
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant">
              Canvas: {canvasWidth} × {canvasHeight}px
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddSlot}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs hover:bg-primary-container active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative max-w-full max-h-[600px] border border-outline-variant/30 rounded-xl overflow-auto bg-surface-container-low"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Frame preview"
            onLoad={handleImageLoad}
            className="max-h-[580px] w-auto block select-none pointer-events-none"
          />

          {/* Slot Bounding Boxes */}
          {slots.map((slot) => {
            const isSelected = selectedSlotIndex === slot.index;
            const left = Math.round(slot.x * scaleX);
            const top = Math.round(slot.y * scaleY);
            const width = Math.round(slot.width * scaleX);
            const height = Math.round(slot.height * scaleY);

            return (
              <div
                key={slot.index}
                onClick={() => setSelectedSlotIndex(slot.index)}
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                className={`absolute cursor-pointer border-2 transition-all flex items-center justify-center ${
                  isSelected
                    ? 'border-primary bg-primary/20 ring-2 ring-primary/40 shadow-xs'
                    : 'border-dashed border-primary/60 bg-secondary-container/20 hover:bg-secondary-container/30'
                }`}
              >
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-xs font-bold font-mono">
                  Slot #{slot.index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coordinate Inspector Sidebar */}
      <div className="w-full md:w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 shadow-xs">
        <h4 className="font-serif font-bold text-lg text-primary mb-3">
          Slot Coordinates ({slots.length})
        </h4>

        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {slots.map((slot) => {
            const isSelected = selectedSlotIndex === slot.index;
            return (
              <div
                key={slot.index}
                onClick={() => setSelectedSlotIndex(slot.index)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-surface-container-low shadow-xs ring-1 ring-primary/30'
                    : 'border-outline-variant/30 hover:border-outline-variant/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary font-mono">
                    Slot #{slot.index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSlot(slot.index);
                    }}
                    className="text-error hover:text-error/80 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-bold">X (px)</label>
                    <input
                      type="number"
                      value={slot.x}
                      onChange={(e) =>
                        handleUpdateCoordinate(slot.index, 'x', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-bold">Y (px)</label>
                    <input
                      type="number"
                      value={slot.y}
                      onChange={(e) =>
                        handleUpdateCoordinate(slot.index, 'y', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 rounded-lg border border-outline-variant/40 bg-surface-container-lowest focus:border-primary focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4b3e42]">Width (px)</label>
                    <input
                      type="number"
                      value={slot.width}
                      onChange={(e) =>
                        handleUpdateCoordinate(slot.index, 'width', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 rounded border-2 border-[#1230c7]/40 bg-white focus:border-[#1230c7] focus:outline-hidden font-[var(--font-space-grotesk)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4b3e42]">Height (px)</label>
                    <input
                      type="number"
                      value={slot.height}
                      onChange={(e) =>
                        handleUpdateCoordinate(slot.index, 'height', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 rounded border-2 border-[#1230c7]/40 bg-white focus:border-[#1230c7] focus:outline-hidden font-[var(--font-space-grotesk)]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
