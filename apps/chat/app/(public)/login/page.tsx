'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@raweval/ui/card';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 px-4">
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
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="text-base font-bold text-white">R</span>
            </div>
            <span className="text-foreground text-xl font-semibold">
              RawEval
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <Card
          className={`border-border shadow-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue chatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
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
                    placeholder="you@example.com"
                    className="border-input bg-background w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                  <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="border-input bg-background w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
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
                <label className="text-muted-foreground flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="border-input rounded border"
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
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="border-border absolute inset-0 flex items-center border-t" />
              <div className="bg-card text-muted-foreground relative px-2 text-xs">
                OR
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
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
          <Link href="/terms" className="hover:text-foreground underline transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-foreground underline transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
