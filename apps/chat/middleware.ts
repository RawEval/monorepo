import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and tenant routing
 * 
 * This runs on every request before the page renders.
 * 
 * Use cases:
 * - Authentication checks
 * - Workspace/tenant routing ([workspaceSlug])
 * - Redirects based on auth state
 * - Setting headers
 */

export function middleware(_request: NextRequest) {
  // TODO: Implement actual authentication check
  // const { pathname } = _request.nextUrl;
  // Public routes that don't require authentication:
  // const publicRoutes = ['/login', '/signup', '/forgot-password'];
  // const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  // For now, allow all routes but you can add auth logic here:
  // 
  // const session = await getSession(request);
  // const isAuthenticated = !!session;
  //
  // // Redirect unauthenticated users trying to access protected routes
  // if (!isAuthenticated && !isPublicRoute) {
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }
  //
  // // Redirect authenticated users away from auth pages
  // if (isAuthenticated && isPublicRoute) {
  //   return NextResponse.redirect(new URL('/chat', request.url));
  // }

  // TODO: Implement workspace/tenant routing
  // if (pathname.startsWith('/[workspaceSlug]')) {
  //   const workspaceSlug = pathname.split('/')[1];
  //   // Validate workspace access
  // }

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
