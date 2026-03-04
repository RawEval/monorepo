'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
} from 'lucide-react';
import { authService } from '@/services/auth-service';
import { storeToken } from '@/lib/auth';
import { isApiError, ValidationError } from '@/lib/errors';
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsSubmitting(true);

    try {
      // Register new user
      await authService.register({
        email: formData.email,
        full_name: formData.name,
        password: formData.password,
      });

      // Auto-login after registration
      // According to OpenAPI spec: login expects { email, password }
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

      // Redirect to chat
      router.push('/chat');
    } catch (err) {
      if (isApiError(err)) {
        if (err instanceof ValidationError) {
          const validationErrors = err.validationErrors;
          if (validationErrors) {
            const firstError = Object.values(validationErrors)[0];
            const errorMessage: string = Array.isArray(firstError)
              ? firstError[0] || 'Validation error'
              : typeof firstError === 'string'
                ? firstError
                : 'Validation error';
            setError(errorMessage);
          } else {
            setError(
              err.message || 'Validation error. Please check your input.'
            );
          }
        } else {
          setError(
            err.message ||
              'An error occurred during registration. Please try again.'
          );
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 px-4 py-8 sm:py-12">
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
            <Image src="/logo.png" alt="RawEval" width={128} height={128} />
          </Link>
        </div>

        {/* Signup Card */}
        <Card
          className={`border-border shadow-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              Create an account
            </CardTitle>
            <CardDescription>
              Get started with AI-powered conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-foreground text-sm font-medium"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setError('');
                    }}
                    placeholder="John Doe"
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

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
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
                    placeholder="Create a password"
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      });
                      setError('');
                    }}
                    placeholder="Confirm your password"
                    className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
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

              {/* Terms */}
              <label className="text-muted-foreground flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      agreedToTerms: e.target.checked,
                    });
                    setError('');
                  }}
                  className="border-input mt-0.5 cursor-pointer rounded border"
                  disabled={isSubmitting}
                />
                <span>
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="border-border absolute inset-0 flex items-center border-t" />
              <div className="bg-card text-muted-foreground relative px-2 text-center text-xs">
                OR
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{' '}
              </span>
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
