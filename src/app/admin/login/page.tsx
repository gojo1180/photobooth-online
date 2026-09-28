'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, Shield, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';
  const { loginAdmin, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as admin, automatically forward to target dashboard
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isAdmin) {
      router.replace(redirectPath);
    }
  }, [isAuthLoading, isAuthenticated, isAdmin, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await loginAdmin(email, password);
      router.replace(redirectPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Admin authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-8 shadow-md">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary text-[10px] font-extrabold uppercase tracking-widest mb-3 shadow-xs">
          <Shield className="w-3.5 h-3.5" /> SECURE ADMIN PORTAL
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary">
          Studio Command
        </h1>
        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Authorized personnel only. Access frame asset management, layout configs, and studio metrics.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Admin Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@studio.com"
              className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Admin Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center justify-center gap-2 mt-5 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Authenticating Admin...' : 'Enter Admin Console'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 pt-5 border-t border-outline-variant/20 flex flex-col gap-2.5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch to Regular User Login</span>
        </Link>
        <Link
          href="/"
          className="text-[11px] uppercase tracking-wider font-bold text-outline hover:text-on-surface transition-colors"
        >
          Return to Studio Home
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Loading Admin Portal...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
