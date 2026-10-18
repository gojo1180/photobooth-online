'use client';

import Link from 'next/link';

interface FooterProps {
  hideWave?: boolean;
}

export function Footer({ hideWave = false }: FooterProps = {}) {
  return (
    <footer className="w-full bg-surface-container-low relative overflow-hidden">
      {/* Wave Scallop Break from Surface/Background to Footer */}
      {!hideWave && (
        <div className="w-full text-surface-container-low leading-none overflow-hidden select-none pointer-events-none -mt-[1px]">
          <svg
            className="w-full h-14 sm:h-18 md:h-24 block fill-background"
            preserveAspectRatio="none"
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,260L48,242C96,224,192,185,288,148C384,110,480,72,576,82C672,92,768,150,864,140C960,130,1056,54,1152,52C1248,54,1344,130,1392,170L1440,205L1440,0L0,0Z" />
          </svg>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-xl">
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-space-sm md:col-span-1">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nevstudio-logo-transparent.png"
                alt="NevStudio"
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Artisanal digital photobooth suite crafted for joyful events, bespoke prints, and playful keepsake strips.
            </p>
            <div className="inline-flex items-center gap-2 mt-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                verified_user
              </span>
              <span className="font-label-sm text-label-sm text-on-surface">
                100% Client-Side Privacy (No Cloud Storage)
              </span>
            </div>
          </div>

          {/* Col 2: Navigate */}
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">
              NAVIGATE
            </h3>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="/solo">
                  Format Catalog
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="/solo">
                  Retro Presets &amp; Filters
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="/solo">
                  Stickers &amp; Typography
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="/admin">
                  Live Studio Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Follow */}
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">
              FOLLOW
            </h3>
            <ul className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="#">
                  @NEVSTUDIO
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="#">
                  Studio Dispatch &amp; Zine
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="#">
                  Community Gallery
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors duration-200 hover:underline underline-offset-4" href="#">
                  Event Photobooth Hire
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Keyboard Shortcuts */}
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-md text-label-md uppercase tracking-wider text-secondary font-bold">
              KEYBOARD SHORTCUTS
            </h3>
            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex justify-between items-center bg-surface-container px-3 py-1.5 rounded-lg">
                <span className="font-body-sm text-body-sm">Capture Photo</span>
                <kbd className="font-label-sm text-label-sm bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-bold">
                  SPACE
                </kbd>
              </div>
              <div className="flex justify-between items-center bg-surface-container px-3 py-1.5 rounded-lg">
                <span className="font-body-sm text-body-sm">Cycle Filter</span>
                <kbd className="font-label-sm text-label-sm bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-bold">
                  TAB
                </kbd>
              </div>
              <div className="flex justify-between items-center bg-surface-container px-3 py-1.5 rounded-lg">
                <span className="font-body-sm text-body-sm">Instant Download</span>
                <kbd className="font-label-sm text-label-sm bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-bold">
                  CMD + S
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container pb-space-md">
          <p>© 2026 NevStudio. All rights reserved.</p>
          <div className="flex items-center gap-space-md">
            <a className="hover:text-on-surface transition-colors duration-200 hover:underline underline-offset-4" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-on-surface transition-colors duration-200 hover:underline underline-offset-4" href="#">
              Terms of Service
            </a>
            <a className="hover:text-on-surface transition-colors duration-200 hover:underline underline-offset-4" href="#">
              Camera Calibration Guide
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
