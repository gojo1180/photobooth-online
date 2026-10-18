'use client';

interface LayoutSessionTipsProps {
  timerSeconds: number;
}

export function LayoutSessionTips({ timerSeconds }: LayoutSessionTipsProps) {
  return (
    <section className="w-full bg-background pt-space-lg pb-space-lg relative">
      <div className="max-w-4xl mx-auto px-margin">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xs rounded-2xl p-space-md sm:p-space-lg border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-space-sm border-b border-outline-variant/20 mb-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
                Studio Session Guide
              </span>
            </div>
            <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
              Tips for your best retro keepsake shots
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            {/* Tip 1: Lighting */}
            <div className="flex flex-col gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
              </div>
              <h4 className="font-headline-sm text-[15px] font-bold text-on-surface mt-1 font-serif">
                Natural Front Lighting
              </h4>
              <p className="font-body-sm text-[13px] leading-relaxed text-on-surface-variant">
                Posisikan wajah menghadap sumber cahaya ruangan agar efek filter retro terlihat cerah dan bertekstur tajam.
              </p>
            </div>

            {/* Tip 2: Timer & Posing */}
            <div className="flex flex-col gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
              <h4 className="font-headline-sm text-[15px] font-bold text-on-surface mt-1 font-serif">
                Pacing &amp; Poses
              </h4>
              <p className="font-body-sm text-[13px] leading-relaxed text-on-surface-variant">
                Gunakan interval {timerSeconds} detik untuk berganti ekspresi. Hitung mundur audio akan memandu setiap jepretan.
              </p>
            </div>

            {/* Tip 3: Privacy */}
            <div className="flex flex-col gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-tertiary-fixed/40 text-tertiary flex items-center justify-center font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <h4 className="font-headline-sm text-[15px] font-bold text-on-surface mt-1 font-serif">
                100% Client-Side Privacy
              </h4>
              <p className="font-body-sm text-[13px] leading-relaxed text-on-surface-variant">
                Semua jepretan diproses langsung di browser perangkat Anda tanpa disimpan di server cloud publik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
