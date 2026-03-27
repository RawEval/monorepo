import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and route protection
 * 
 * This runs on every request before the page renders.
 * 
 * Protected routes:
 * - /workbench - Requires authentication
 * - /interview - Requires authentication
 * - /onboarding - Requires authentication
 * - /results - Requires authentication
 * - /history - Requires authentication
 * - /profile - Requires authentication
 * 
 * Public routes:
 * - / (landing page)
 * - /login - Sign in page
 * - /register - Registration page
 * - /verify-email - Email verification page
 * - /forgot-password - Password reset page
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In demo mode, skip all auth checks
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/workbench', '/interview', '/onboarding', '/results', '/history', '/profile'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if user has a valid token (client-side check via cookie)
  // In a real implementation, we'd verify the token server-side
  const token = request.cookies.get('raweval_access_token')?.value;
  const isAuthenticated = !!token;

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages (but not verify-email or forgot-password)
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
