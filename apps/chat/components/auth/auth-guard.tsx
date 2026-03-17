'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStoredToken, getStoredRefreshToken, storeToken, clearToken } from '@/lib/auth';
import { authService } from '@/services/auth-service';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side auth guard — wraps authenticated routes.
 *
 * Responsibilities:
 * 1. Verify the token is valid (not just present — middleware only checks existence)
 * 2. Attempt refresh if the access token is expired but refresh token exists
 * 3. Show a loading skeleton while verifying (prevents flash of content)
 * 4. Redirect to /login if auth fails completely
 *
 * Middleware handles the server-side cookie check (no-flash redirect).
 * This guard handles the client-side validation as a safety net.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const verify = useCallback(async () => {
    const token = getStoredToken();

    // No token at all — middleware should have caught this, but handle it
    if (!token) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          const res = await authService.refreshToken(refreshToken);
          storeToken(res.access_token, res.expires_in, res.refresh_token);
          setStatus('authenticated');
          return;
        } catch {
          clearToken();
        }
      }
      setStatus('unauthenticated');
      return;
    }

    // Token exists — verify it's still valid by hitting /users/me
    try {
      await authService.getCurrentUser();
      setStatus('authenticated');
    } catch {
      // Token may be expired — try refresh
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          const res = await authService.refreshToken(refreshToken);
          storeToken(res.access_token, res.expires_in, res.refresh_token);
          setStatus('authenticated');
          return;
        } catch {
          // Refresh also failed
        }
      }
      clearToken();
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const loginUrl = `/login${pathname !== '/chat' && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`;
      router.replace(loginUrl);
    }
  }, [status, router, pathname]);

  // Loading state — show a minimal skeleton that matches the layout structure
  if (status === 'loading') {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-t-transparent"
            style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'transparent' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              letterSpacing: '0.06em',
            }}
          >
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated — render nothing while redirect happens
  if (status === 'unauthenticated') {
    return null;
  }

  // Authenticated — render the protected content
  return <>{children}</>;
}
