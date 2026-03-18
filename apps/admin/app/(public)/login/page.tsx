'use client';

import { useState, useEffect, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@raweval/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Logo area */}
      <div
        className={`mb-8 flex flex-col items-center gap-3 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      >
        <Image
          src="/logo.png"
          alt="RawEval"
          width={128}
          height={128}
          style={{
            objectFit: 'contain',
            filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)',
          }}
        />
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1 text-xs">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        </div>
      </div>

      {/* Login Card */}
      <Card
        className={`border-border shadow-xl ${mounted ? 'animate-fade-in delay-100' : 'opacity-0'}`}
      >
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">
            Admin Sign In
          </CardTitle>
          <CardDescription>
            Sign in with your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
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
                  placeholder="admin@raweval.com"
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  disabled={isLoading}
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
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p
        className={`text-muted-foreground mt-6 text-center text-xs ${mounted ? 'animate-fade-in delay-200' : 'opacity-0'}`}
      >
        This is an internal admin dashboard. Unauthorized access is prohibited.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="via-background flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/30 px-4 py-8 sm:py-12">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%230f172a'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading login...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
