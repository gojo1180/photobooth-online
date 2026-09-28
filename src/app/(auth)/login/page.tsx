'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ArrowRight, Camera, AlertCircle, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { loginUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await loginUser(email, password);
      router.push(redirectPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase tracking-widest mb-3">
          <Camera className="w-3.5 h-3.5" /> USER ACCESS
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary">
          Sign In to Booth
        </h1>
        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Sign in to unlock Online Duo Rooms, multi-camera collaboration, and photo exports.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Password
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
          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center justify-center gap-2 mt-5 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 pt-5 border-t border-outline-variant/20 flex flex-col gap-3 text-center">
        <p className="text-xs text-on-surface-variant">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-bold text-primary hover:underline"
          >
            Create an Account
          </Link>
        </p>

        <div className="pt-2">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Portal Access</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Loading Studio Access...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
