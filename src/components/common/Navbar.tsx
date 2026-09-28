'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePhotoboothStore, type WizardStep } from '@/stores/usePhotoboothStore';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { step, setStep } = usePhotoboothStore();
  const { user, isAuthenticated, signOut } = useAuth();

  const navLinks: { label: string; href: string; stepKey?: WizardStep }[] = [
    { label: 'HOME', href: '/' },
    { label: 'SELECT FORMAT', href: '/solo', stepKey: 'SELECT_LAYOUT' },
    { label: 'PHOTO SESSION', href: '/solo', stepKey: 'CAPTURE' },
    { label: 'FRAME EDITOR', href: '/solo', stepKey: 'CUSTOMIZE' },
    { label: 'PRINT / EXPORT', href: '/solo', stepKey: 'EXPORT' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-shadow duration-300">
      <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-space-sm transition-opacity duration-200 hover:opacity-80">
          {/* Inline SVG brand mark: no external image dependency */}
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-cobalt-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="14" rx="3" fill="white" fillOpacity="0.9" />
              <circle cx="12" cy="13" r="4" fill="#001c97" fillOpacity="0.8" />
              <circle cx="12" cy="13" r="2" fill="white" fillOpacity="0.6" />
              <rect x="8" y="3" width="8" height="4" rx="1.5" fill="white" fillOpacity="0.7" />
              <circle cx="18" cy="9" r="1" fill="#fea12b" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-primary leading-tight tracking-tight uppercase">
              Scribblepie
            </span>
            <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">
              Snapbooth Studio
            </span>
          </div>
        </Link>

        {/* Navigation Pills */}
        <nav
          className="hidden xl:flex items-center gap-space-xs bg-surface-container-low px-space-xs py-1 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        >
          {navLinks.map((link) => {
            const isSolo = pathname.startsWith('/solo');
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : isSolo
                  ? link.stepKey === step
                  : pathname.startsWith(link.href);

            const handleClick = (e: React.MouseEvent) => {
              if (isSolo && link.stepKey) {
                e.preventDefault();
                setStep(link.stepKey);
              }
            };

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={handleClick}
                className={
                  isActive
                    ? 'uppercase px-space-sm py-2 transition-all duration-200 bg-primary-container text-on-primary rounded-lg shadow-cobalt-sm font-bold font-label-md text-label-md'
                    : 'font-label-md text-label-md uppercase px-space-sm py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA and Profile */}
        <div className="flex items-center gap-space-sm">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-[11px] font-bold text-on-surface">
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
              className="text-[12px] font-bold uppercase tracking-wider text-primary hover:text-secondary px-3 py-2 rounded-lg hover:bg-surface-container transition-all"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/solo"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md uppercase px-space-md py-3 rounded-lg shadow-dark transition-all duration-200 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>START PHOTOBOOTH</span>
          </Link>
          <Link
            href="/admin"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-all duration-200 hover:scale-110 active:scale-95"
            title="Admin Dashboard"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
