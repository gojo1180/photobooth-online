'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useRoomStore } from '@/stores/useRoomStore';
import { calculateCoverCrop } from '@/lib/konva-helpers';
import { Users, Wifi } from 'lucide-react';

export interface DualCameraGridRef {
  captureDualSnapshot: () => string | null;
}

interface DualCameraGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export const DualCameraGrid = forwardRef<DualCameraGridRef, DualCameraGridProps>(
  ({ localStream, remoteStream }, ref) => {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const { role, peerStatus } = useRoomStore();

    useEffect(() => {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }, [localStream]);

    useEffect(() => {
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }, [remoteStream]);

    // PRD 5.2.3: Side-by-Side Dual Stream Capture (50% Host on Left, 50% Guest on Right)
    useImperativeHandle(ref, () => ({
      captureDualSnapshot: (): string | null => {
        const localVid = localVideoRef.current;
        const remoteVid = remoteVideoRef.current;

        if (!localVid) return null;

        const canvas = document.createElement('canvas');
        // Standard slot aspect ratio: 800 x 600 (each partition is 400 x 600, 1:1.5 portrait partition)
        const totalWidth = 800;
        const totalHeight = 600;
        const halfWidth = totalWidth / 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Background
        ctx.fillStyle = '#2E0F15';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        // Identify Host Video and Guest Video
        const hostVideo = role === 'host' ? localVid : remoteVid;
        const guestVideo = role === 'host' ? remoteVid : localVid;
        const isHostLocal = role === 'host';
        const isGuestLocal = role === 'guest';

        // Helper to draw a video stream into a partition with cover crop
        const drawPartition = (
          video: HTMLVideoElement | null,
          isLocal: boolean,
          dx: number,
          dy: number,
          dw: number,
          dh: number,
          label: string
        ) => {
          if (video && video.readyState >= 2 && video.videoWidth > 0) {
            const crop = calculateCoverCrop(
              video.videoWidth,
              video.videoHeight,
              dw,
              dh
            );

            ctx.save();
            // Clip to half partition
            ctx.beginPath();
            ctx.rect(dx, dy, dw, dh);
            ctx.clip();

            if (isLocal) {
              // Mirror selfie feed
              ctx.translate(dx + dw, dy);
              ctx.scale(-1, 1);
              ctx.drawImage(
                video,
                crop.sx,
                crop.sy,
                crop.sWidth,
                crop.sHeight,
                0,
                0,
                dw,
                dh
              );
            } else {
              ctx.drawImage(
                video,
                crop.sx,
                crop.sy,
                crop.sWidth,
                crop.sHeight,
                dx,
                dy,
                dw,
                dh
              );
            }
            ctx.restore();
          } else {
            // Draw placeholder if stream is not ready
            ctx.fillStyle = '#1c1c18';
            ctx.fillRect(dx, dy, dw, dh);
            ctx.fillStyle = '#FDFBF7';
            ctx.font = 'bold 14px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, dx + dw / 2, dy + dh / 2);
          }
        };

        // Left 50%: Host Area (Slot.x, Slot.y, Width_half, Slot.height)
        drawPartition(hostVideo, isHostLocal, 0, 0, halfWidth, totalHeight, 'HOST (Waiting)');

        // Right 50%: Guest Area (Slot.x + Width_half, Slot.y, Width_half, Slot.height)
        drawPartition(guestVideo, isGuestLocal, halfWidth, 0, halfWidth, totalHeight, 'GUEST (Waiting)');

        return canvas.toDataURL('image/jpeg', 0.95);
      },
    }));

    return (
      <div className="w-full">
        {/* Top Connection Status Ribbon */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold uppercase tracking-wider shadow-xs border border-secondary/20">
              Role: {role ? role.toUpperCase() : 'GUEST'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-[11px] font-semibold text-on-surface shadow-xs">
              <Wifi className={`w-3.5 h-3.5 ${peerStatus === 'connected' ? 'text-green-600' : 'text-amber-500'}`} />
              <span>Peer: {peerStatus.toUpperCase()}</span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container-low border border-outline-variant/30 px-3 py-1 rounded-full">
            50% Host (Left) • 50% Guest (Right)
          </span>
        </div>

        {/* Dual Split Video Feeds (50% Host / 50% Guest) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Stream */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-on-surface border border-outline-variant/30 shadow-md">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-on-primary text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
              YOU ({role === 'host' ? 'HOST' : 'GUEST'})
            </div>
          </div>

          {/* Remote Stream */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-on-surface border border-outline-variant/30 shadow-md flex items-center justify-center">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-surface-container-lowest">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-60 animate-pulse text-secondary-container" />
                <p className="font-serif italic text-lg text-surface-bright">Waiting for companion...</p>
                <p className="text-xs text-surface-variant mt-1">Share room link above to connect</p>
              </div>
            )}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
              COMPANION ({role === 'host' ? 'GUEST' : 'HOST'})
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DualCameraGrid.displayName = 'DualCameraGrid';

