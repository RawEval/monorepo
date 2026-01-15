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
  // TODO: Implement authentication check
  // const session = await getSession(request);
  // if (!session && request.nextUrl.pathname.startsWith('/app')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // TODO: Implement workspace/tenant routing
  // if (request.nextUrl.pathname.startsWith('/[workspaceSlug]')) {
  //   const workspaceSlug = request.nextUrl.pathname.split('/')[1];
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
