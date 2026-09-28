'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, ArrowRight, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(email, password, displayName);
      if (res.access_token) {
        setSuccess('Registration successful! Redirecting you to the studio...');
        setTimeout(() => {
          router.push(redirectPath);
        }, 1200);
      } else {
        setSuccess('Account created! Please check your email to confirm your account or sign in.');
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        }, 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed border border-secondary/20 text-[10px] font-extrabold uppercase tracking-widest mb-3">
          <Camera className="w-3.5 h-3.5" /> NEW ACCOUNT
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary">
          Join PhotoBooth
        </h1>
        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Create an account to host Duo Rooms, invite friends with room codes, and customize photo strips.
        </p>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notice */}
      {success && (
        <div className="mb-5 p-3.5 rounded-2xl bg-green-50 border border-green-200 text-xs text-green-800 font-medium flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Full Name / Display Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Rivers"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

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
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Password (Min. 6 Characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-outline-variant/40 bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary text-xs font-extrabold uppercase tracking-widest shadow-xs flex items-center justify-center gap-2 mt-5 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center">
        <p className="text-xs text-on-surface-variant">
          Already have an account?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-bold text-primary hover:underline"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Loading Registration...
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
