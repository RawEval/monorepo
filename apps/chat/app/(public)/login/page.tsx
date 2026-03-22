'use client';

import { useState, useEffect, useRef, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@raweval/ui/card';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth-service';
import { storeToken } from '@/lib/auth';
import { isApiError, ApiError, UnauthorizedError } from '@/lib/errors';
import Image from 'next/image';
import logoImg from '@/public/logo.png';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/chat';
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services and render button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !mounted) return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            setIsGoogleLoading(true);
            setError('');
            const result = await authService.googleAuth(response.credential);
            storeToken(result.access_token, result.expires_in, result.refresh_token);
            router.push(redirectTo);
          } catch {
            setError('Google sign-in failed. Please try again.');
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: googleBtnRef.current.offsetWidth,
      });
    };

    if (document.getElementById('google-gsi-script')) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [mounted, router, redirectTo]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call auth service to login
      // According to OpenAPI spec: expects { email, password }
      const tokenResponse = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Store token and refresh token
      storeToken(
        tokenResponse.access_token,
        tokenResponse.expires_in,
        tokenResponse.refresh_token
      );

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect to intended page (or /chat by default)
      router.push(redirectTo);
    } catch (err) {
      if (isApiError(err)) {
        // Check for EMAIL_NOT_VERIFIED error
        const errorResponse = (err as ApiError).response as Record<string, unknown> | undefined;
        const errorCode =
          (errorResponse?.error as string) ??
          (errorResponse?.detail as string);
        if (errorCode === 'EMAIL_NOT_VERIFIED') {
          // Send verification code and redirect
          try {
            await authService.sendVerification(formData.email);
          } catch {
            // Continue to verification page even if send fails
          }
          router.push(
            `/verify-email?email=${encodeURIComponent(formData.email)}`
          );
          return;
        }

        if (err instanceof UnauthorizedError) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(
            err.message || 'An error occurred during login. Please try again.'
          );
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4 py-8 sm:py-12">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%230f172a'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div
          className={`mb-8 flex justify-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src={logoImg} alt="RawEval" width={140} height={40} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }} />
          </Link>
        </div>

        {/* Login Card */}
        <Card
          className={`border-border shadow-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue chatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-foreground text-sm font-medium"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setError('');
                    }}
                    placeholder="you@example.com"
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-base sm:text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-foreground text-sm font-medium"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setError('');
                    }}
                    placeholder="Enter your password"
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-10 pl-10 text-base sm:text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="border-input cursor-pointer rounded border"
                    disabled={isSubmitting}
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card text-muted-foreground px-4">or</span>
              </div>
            </div>

            {/* Google Sign-In */}
            {isGoogleLoading ? (
              <div className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-[#dadce0] bg-white px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#3c4043]" />
                <span className="text-sm font-medium text-[#3c4043]">Signing in...</span>
              </div>
            ) : (
              <div
                ref={googleBtnRef}
                className="flex w-full items-center justify-center overflow-hidden rounded-lg [&>div]:w-full [&_iframe]:w-full!"
              />
            )}

            {/* Sign up link */}
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{' '}
              </span>
              <Link
                href="/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p
          className={`text-muted-foreground mt-6 text-center text-xs ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}
        >
          By signing in, you agree to our{' '}
          <Link
            href="/terms"
            className="hover:text-foreground underline transition-colors"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="hover:text-foreground underline transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
