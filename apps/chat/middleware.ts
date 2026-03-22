import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware — Auth gate
 *
 * Checks for the access token cookie server-side BEFORE the page renders.
 * This eliminates the flash of authenticated UI for unauthenticated users.
 *
 * We can only read cookies here (not verify JWTs, since that needs a secret).
 * The client-side AuthGuard handles token validation/refresh as a fallback.
 */

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/verify-email', '/terms', '/privacy'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const token = request.cookies.get('raweval_access_token')?.value;

  // Unauthenticated user trying to access a protected route → redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so we can redirect back after login
    if (pathname !== '/' && pathname !== '/chat') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on a public auth page → redirect to chat
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
