'use client';

import { useState, useEffect, useRef, useCallback, Suspense, KeyboardEvent, ClipboardEvent } from 'react';
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
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { authService } from '@/services/auth-service';
import { storeToken } from '@/lib/auth';
import { isApiError } from '@/lib/errors';
import Image from 'next/image';
import logoImg from '@/public/logo.png';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
          <div
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent"
            style={{
              borderColor: 'var(--color-border-strong)',
              borderTopColor: 'transparent',
            }}
          />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [mounted, setMounted] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    // Auto-focus first input on mount
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  const submitOtp = useCallback(
    async (code: string) => {
      if (code.length !== 6 || isVerifying) return;

      setIsVerifying(true);
      setError('');

      try {
        const tokenResponse = await authService.verifyEmail(email, code);
        storeToken(
          tokenResponse.access_token,
          tokenResponse.expires_in,
          tokenResponse.refresh_token
        );
        router.push('/chat');
      } catch (err) {
        if (isApiError(err)) {
          setError(err.message || 'Invalid verification code. Please try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        // Clear inputs on error
        setOtp(Array(6).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        setIsVerifying(false);
      }
    },
    [email, isVerifying, router]
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digits
      const digit = value.replace(/\D/g, '').slice(-1);

      setOtp((prev) => {
        const next = [...prev];
        next[index] = digit;

        // Auto-submit when all 6 digits are filled
        if (digit && index === 5) {
          const code = next.join('');
          if (code.length === 6) {
            submitOtp(code);
          }
        }

        return next;
      });

      setError('');

      // Auto-advance to next input
      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [submitOtp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!otp[index] && index > 0) {
          // Move back to previous input
          inputRefs.current[index - 1]?.focus();
          setOtp((prev) => {
            const next = [...prev];
            next[index - 1] = '';
            return next;
          });
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;

      const digits = pasted.split('');
      const newOtp = Array(6).fill('');
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      setError('');

      // Focus the input after the last pasted digit
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();

      // Auto-submit if 6 digits pasted
      if (digits.length === 6) {
        submitOtp(newOtp.join(''));
      }
    },
    [submitOtp]
  );

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      await authService.sendVerification(email);
      setResendCooldown(60);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message || 'Failed to resend code. Please try again.');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

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
            <Image
              src={logoImg}
              alt="RawEval"
              width={140}
              height={40}
              style={{
                objectFit: 'contain',
                filter:
                  'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)',
              }}
            />
          </Link>
        </div>

        {/* Verify Email Card */}
        <Card
          className={`border-border shadow-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}
        >
          <CardHeader className="space-y-1 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Mail className="text-primary h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Verify your email
            </CardTitle>
            <CardDescription>
              We sent a 6-digit code to{' '}
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-sm">
                {error}
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isVerifying}
                  aria-label={`Digit ${index + 1} of verification code`}
                  className="border-input bg-background focus:ring-ring focus:border-primary h-11 w-11 rounded-lg border text-center text-base font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl"
                />
              ))}
            </div>

            {/* Verifying indicator */}
            {isVerifying && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </div>
            )}

            {/* Resend code */}
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm">
                Didn&apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sending...
                  </span>
                ) : resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
                ) : (
                  'Resend code'
                )}
              </button>
            </div>

            {/* Back to login */}
            <div className="pt-2">
              <Link href="/login">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
