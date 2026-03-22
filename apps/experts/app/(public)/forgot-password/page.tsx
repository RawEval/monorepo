'use client';

import { useState, useEffect, useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@raweval/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@raweval/ui/card';
import {
  ArrowRight,
  Mail,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '@/services/auth-service';
import { isApiError } from '@raweval/api-client';

type Step = 'email' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password))
      return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password))
      return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password))
      return 'Password must contain at least one number';
    return null;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
      setResendCooldown(60);
      setStep('reset');
      // Focus first OTP input after transition
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message || 'Failed to send reset code. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(email, code, newPassword);
      setStep('success');
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message || 'Failed to reset password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);

      setOtp((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });

      setError('');

      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [],
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!otp[index] && index > 0) {
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
    [otp],
  );

  const handleOtpPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, 6);
      if (!pasted) return;

      const digits = pasted.split('');
      const newOtp = Array(6).fill('');
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      setError('');

      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    },
    [],
  );

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      await authService.forgotPassword(email);
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

  // Success state
  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4">
        <div className="relative w-full max-w-md">
          <Card
            className={`border-border shadow-xl ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
          >
            <CardHeader className="space-y-1 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 className="text-primary h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Password reset
              </CardTitle>
              <CardDescription>
                Your password has been reset successfully. You can now sign in
                with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full gap-2" size="lg">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <Image src="/logo.png" alt="RawEval" width={128} height={128} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }} />
          </Link>
        </div>

        {/* Forgot Password Card */}
        <Card
          className={`border-border shadow-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              {step === 'email' ? 'Forgot password?' : 'Reset your password'}
            </CardTitle>
            <CardDescription>
              {step === 'email'
                ? "Enter your email address and we'll send you a code to reset your password"
                : (
                    <>
                      Enter the 6-digit code sent to{' '}
                      <strong className="text-foreground">{email}</strong> and
                      choose a new password
                    </>
                  )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-foreground text-sm font-medium"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@example.com"
                      className="border-input bg-background w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
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
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send reset code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {/* OTP Inputs */}
                <div className="space-y-2">
                  <label className="text-foreground text-sm font-medium">
                    Verification code
                  </label>
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
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        disabled={isSubmitting}
                        aria-label={`Digit ${index + 1} of reset code`}
                        className="border-input bg-background focus:ring-ring focus:border-primary h-12 w-10 rounded-lg border text-center text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl"
                      />
                    ))}
                  </div>
                  {/* Resend code */}
                  <div className="text-center">
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
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="text-foreground text-sm font-medium"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter new password"
                      className="border-input bg-background w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Must be at least 8 characters with uppercase, lowercase, and
                    number
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-foreground text-sm font-medium"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Confirm new password"
                      className="border-input bg-background w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                      Resetting password...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

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

        {/* Footer */}
        <p
          className={`text-muted-foreground mt-6 text-center text-xs ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}
        >
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
