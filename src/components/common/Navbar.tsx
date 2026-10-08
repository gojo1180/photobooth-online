'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePhotoboothStore, type WizardStep } from '@/stores/usePhotoboothStore';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    step,
    setStep,
    selectedLayoutId,
    expectedPhotoCount,
    capturedPhotos,
    selectedFrame,
  } = usePhotoboothStore();
  const { user, isAuthenticated, signOut } = useAuth();

  const isSolo = pathname.startsWith('/solo');
  const hasLayout = Boolean(selectedLayoutId && expectedPhotoCount > 0);
  const hasCompleteCapture = hasLayout && capturedPhotos.length >= expectedPhotoCount;

  const canNavigateTo = (target?: WizardStep) => {
    if (!target || target === 'SELECT_LAYOUT') return true;
    if (target === 'CAPTURE') return hasLayout;
    if (target === 'CUSTOMIZE') return hasCompleteCapture;
    return hasCompleteCapture && Boolean(selectedFrame);
  };

  const navLinks: { label: string; href: string; stepKey?: WizardStep }[] = [
    { label: 'HOME', href: '/' },
    { label: 'SELECT FORMAT', href: '/solo', stepKey: 'SELECT_LAYOUT' },
    { label: 'PHOTO SESSION', href: '/solo', stepKey: 'CAPTURE' },
    { label: 'FRAME EDITOR', href: '/solo', stepKey: 'CUSTOMIZE' },
    { label: 'PRINT / EXPORT', href: '/solo', stepKey: 'EXPORT' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-2">
        {/* Brand logo */}
        <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex min-w-0 items-center gap-2 transition-opacity duration-200 hover:opacity-80">
          {/* Inline SVG brand mark: no external image dependency */}
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary flex items-center justify-center shadow-cobalt-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="14" rx="3" fill="white" fillOpacity="0.9" />
              <circle cx="12" cy="13" r="4" fill="#001c97" fillOpacity="0.8" />
              <circle cx="12" cy="13" r="2" fill="white" fillOpacity="0.6" />
              <rect x="8" y="3" width="8" height="4" rx="1.5" fill="white" fillOpacity="0.7" />
              <circle cx="18" cy="9" r="1" fill="#fea12b" />
            </svg>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-headline-md text-[17px] sm:text-[20px] text-primary leading-tight tracking-tight uppercase">
              Scribblepie
            </span>
            <span className="hidden min-[360px]:block truncate font-label-sm text-[9px] sm:text-label-sm text-secondary tracking-widest uppercase">
              Snapbooth Studio
            </span>
          </div>
        </Link>

        {/* Navigation Pills */}
        <nav
          className="hidden xl:flex items-center gap-space-xs bg-surface-container-low px-space-xs py-1 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : isSolo
                  ? link.stepKey === step
                  : pathname.startsWith(link.href);
            const isEnabled = !isSolo || canNavigateTo(link.stepKey);

            const handleClick = (e: React.MouseEvent) => {
              setIsMenuOpen(false);
              if (isSolo && link.stepKey) {
                e.preventDefault();
                if (isEnabled) setStep(link.stepKey);
              }
            };

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={handleClick}
                aria-disabled={!isEnabled}
                title={!isEnabled ? 'Complete the previous step first' : undefined}
                className={
                  isActive
                    ? 'uppercase px-space-sm py-2 transition-all duration-200 bg-primary-container text-on-primary rounded-lg shadow-cobalt-sm font-bold font-label-md text-label-md'
                    : isEnabled
                      ? 'font-label-md text-label-md uppercase px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200'
                      : 'font-label-md text-label-md uppercase px-space-sm py-2 rounded-lg text-on-surface-variant/35 cursor-not-allowed'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA and Profile */}
        <div className="hidden sm:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-[11px] font-bold text-on-surface">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="max-w-[120px] truncate">{user?.email?.split('@')[0] || 'User'}</span>
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-container transition-all cursor-pointer"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:block text-[12px] font-bold uppercase tracking-wider text-primary hover:text-secondary px-3 py-2 rounded-lg hover:bg-surface-container transition-all"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/admin"
            className="hidden lg:flex w-8 h-8 rounded-full bg-primary items-center justify-center cursor-pointer hover:bg-primary-container transition-all duration-200 hover:scale-110 active:scale-95"
            title="Admin Dashboard"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="xl:hidden w-10 h-10 shrink-0 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-primary flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="xl:hidden border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-4 shadow-lg">
          <nav className="max-w-2xl mx-auto flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : isSolo
                    ? link.stepKey === step
                    : pathname.startsWith(link.href);
              const isEnabled = !isSolo || canNavigateTo(link.stepKey);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-disabled={!isEnabled}
                  onClick={(event) => {
                    setIsMenuOpen(false);
                    if (isSolo && link.stepKey) {
                      event.preventDefault();
                      if (isEnabled) setStep(link.stepKey);
                    }
                  }}
                  className={`w-full rounded-xl px-4 py-3 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider transition-colors ${isActive
                      ? 'bg-primary text-on-primary'
                      : isEnabled
                        ? 'text-on-surface hover:bg-surface-container'
                        : 'text-on-surface-variant/40 cursor-not-allowed'
                    }`}
                >
                  <span>{link.label}</span>
                  {!isEnabled && <span className="material-symbols-outlined text-[16px]">lock</span>}
                </Link>
              );
            })}

            <div className="mt-3 pt-3 border-t border-outline-variant/20 grid grid-cols-2 gap-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await signOut();
                  }}
                  className="rounded-xl bg-surface-container px-4 py-3 text-xs font-bold uppercase text-on-surface"
                >
                  Sign Out
                </button>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="rounded-xl bg-surface-container px-4 py-3 text-center text-xs font-bold uppercase text-on-surface">
                  Sign In
                </Link>
              )}
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="rounded-xl bg-secondary-fixed px-4 py-3 text-center text-xs font-bold uppercase text-on-secondary-fixed">
                Admin
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
