'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (data.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch {
      setError('Unable to connect. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Round
          </span>
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Up
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] -ml-0.5 mt-1.5" />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 border border-[var(--border-primary)] bg-[var(--bg-card)]"
          style={{ boxShadow: '0 8px 32px var(--shadow)' }}
        >
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Sign in to continue where you left off
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] text-sm outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] text-sm outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-[var(--accent-red)] bg-[var(--accent-red)]/10 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--accent-green)] text-[#121212] font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-[var(--accent-blue)] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
