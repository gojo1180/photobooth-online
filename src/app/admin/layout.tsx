'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LayoutGrid, Image as ImageIcon, PlusCircle, Home, Shield, LogOut } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/layouts', label: 'Grid Layouts', icon: LayoutGrid },
  { href: '/admin/frames', label: 'Frame Gallery', icon: ImageIcon },
  { href: '/admin/frames/new', label: 'New Frame & Mapper', icon: PlusCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading, signOut } = useAuth();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If on the login page itself, don't redirect
    if (isLoginPage) return;

    // Check if user is authenticated and is an admin
    if (!isLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoginPage, isLoading, isAuthenticated, isAdmin, pathname, router]);

  // If on login page, render clean page without admin sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while checking admin session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center animate-pulse">
            <Shield className="w-5 h-5 text-on-secondary-container" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-space-grotesk)]">
            Verifying Admin Credentials...
          </span>
        </div>
      </div>
    );
  }

  // If not admin, return null while redirecting
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container-lowest border-b md:border-b-0 md:border-r border-outline-variant/30 p-5 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container shadow-xs flex items-center justify-center border border-outline-variant/20">
              <Shield className="w-4 h-4 text-on-secondary-container" />
            </div>
            <div>
              <h2 className="font-[var(--font-vollkorn)] font-bold text-lg text-primary leading-tight">
                Studio Admin
              </h2>
              <span className="font-[var(--font-space-grotesk)] text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                Asset &amp; Grid Manager
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-[var(--font-space-grotesk)] active:scale-[0.98] ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-outline-variant/30 mt-6 flex flex-col gap-2">
          {/* Admin User Chip */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 mb-1">
            <div className="flex flex-col overflow-hidden pr-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary">
                Administrator
              </span>
              <span className="text-xs font-bold text-on-surface truncate">
                {user?.email || 'admin@studio.com'}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push('/admin/login');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Back to Booth Link */}
          <Link
            href="/"
            className="w-full py-2.5 px-3 rounded-xl border border-outline-variant/30 bg-surface-container hover:bg-primary hover:text-white text-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-[0.98] font-[var(--font-space-grotesk)]"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Photobooth</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
