'use client';

interface CaptureReelProgressProps {
  expectedPhotoCount: number;
  capturedPhotos: string[];
  progressPercent: number;
  onRetake: (index: number) => void;
}

export function CaptureReelProgress({
  expectedPhotoCount,
  capturedPhotos,
  progressPercent,
  onRetake,
}: CaptureReelProgressProps) {
  return (
    <div className="w-full bg-surface-container-lowest p-space-md rounded-xl shadow-sm my-space-md border border-outline-variant/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-2">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary uppercase font-serif">
            PHOTOSTRIP REEL PROGRESS
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Complete all {expectedPhotoCount} candid poses to generate your physical print layout.
          </p>
        </div>
        <div className="flex items-center gap-1 font-label-sm text-label-sm px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full self-start font-bold">
          <span className="material-symbols-outlined text-[16px]">photo_library</span>
          <span>Progress: {progressPercent}% Done</span>
        </div>
      </div>

      {/* Strip Slots Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {Array.from({ length: expectedPhotoCount }).map((_, i) => {
          const photo = capturedPhotos[i];
          const isCurrentActive = i === capturedPhotos.length;
          const isNextInQueue = i === capturedPhotos.length + 1;

          if (photo) {
            return (
              <div
                key={i}
                className="bg-surface-container-lowest p-space-xs rounded-lg shadow-xs flex flex-col border border-outline-variant/30"
              >
                <div className="relative aspect-[3/4] rounded overflow-hidden bg-surface-dim mb-space-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover"
                    src={photo}
                    alt={`Pose #${i + 1}`}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold">
                    Pose #0{i + 1}
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                </div>
                <div className="p-1 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold">
                    SAVED
                  </span>
                  <button
                    onClick={() => onRetake(i)}
                    className="font-label-sm text-label-sm text-secondary hover:underline inline-flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <span>Retake</span>
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                  </button>
                </div>
              </div>
            );
          }

          if (isCurrentActive) {
            return (
              <div
                key={i}
                className="bg-tertiary-fixed/30 p-space-xs rounded-lg shadow-[3px_3px_0px_#541b44] flex flex-col relative border border-tertiary-fixed"
              >
                <div className="relative aspect-[3/4] rounded overflow-hidden bg-tertiary-container text-on-tertiary flex flex-col items-center justify-center p-space-sm text-center mb-space-xs">
                  <div
                    className="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mb-2 animate-spin"
                    style={{ animationDuration: '3s' }}
                  >
                    <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
                  </div>
                  <span className="font-headline-md text-label-md uppercase text-on-tertiary font-bold">
                    Ready for Pose...
                  </span>
                  <p className="font-body-sm text-[11px] text-tertiary-fixed mt-1">
                    Look at the lens now!
                  </p>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-tertiary text-on-tertiary font-label-sm text-label-sm uppercase font-bold">
                    Pose #0{i + 1} (ACTIVE)
                  </div>
                </div>
                <div className="p-1 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-tertiary uppercase font-bold">
                    TARGETING LENS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                </div>
              </div>
            );
          }

          if (isNextInQueue) {
            return (
              <div
                key={i}
                className="bg-surface-container-low p-space-xs rounded-lg shadow-[2px_2px_0px_#c5c5d7] flex flex-col opacity-80 border border-surface-container"
              >
                <div className="relative aspect-[3/4] rounded overflow-hidden bg-surface-container flex flex-col items-center justify-center p-space-sm text-center mb-space-xs">
                  <span className="material-symbols-outlined text-outline text-[32px] mb-1">
                    add_a_photo
                  </span>
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-bold">
                    Pose #0{i + 1}
                  </span>
                  <span className="font-body-sm text-[11px] text-outline mt-0.5">
                    Next in line
                  </span>
                </div>
                <div className="p-1 text-center">
                  <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-bold">
                    UPCOMING POSE
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="bg-surface-container-low p-space-xs rounded-lg shadow-[2px_2px_0px_#c5c5d7] flex flex-col opacity-60 border border-surface-container"
            >
              <div className="relative aspect-[3/4] rounded overflow-hidden bg-surface-container flex flex-col items-center justify-center p-space-sm text-center mb-space-xs">
                <span className="material-symbols-outlined text-outline text-[32px] mb-1">
                  lock
                </span>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-bold">
                  Pose #0{i + 1}
                </span>
                <span className="font-body-sm text-[11px] text-outline mt-0.5">
                  Pending Slot
                </span>
              </div>
              <div className="p-1 text-center">
                <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-bold">
                  IN QUEUE
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
