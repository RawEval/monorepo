'use client';

import { VercelToolbar } from '@vercel/toolbar/next';
import { Suspense } from 'react';

/**
 * Vercel Toolbar Component
 * 
 * Conditionally renders the Vercel Toolbar only for team members.
 * 
 * According to Vercel docs, this should be conditionally injected
 * to avoid showing it to all visitors.
 * 
 * @see https://vercel.com/docs/vercel-toolbar/in-production-and-localhost/add-to-production
 */

/**
 * Check if the current user is a team member who should see the toolbar
 * 
 * This can be enhanced with actual authentication logic later.
 * For now, checks environment variable or Vercel team membership.
 */
function useIsTeamMember(): boolean {
  // In Vercel deployments, you can check for team membership
  // This is a placeholder - implement based on your auth system
  // 
  // Options:
  // 1. Check environment variable (set in Vercel dashboard)
  // 2. Check user session/authentication
  // 3. Use Vercel's built-in team detection
  
  if (typeof window === 'undefined') {
    return false;
  }

  // For development: check environment variable
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_VERCEL_TOOLBAR_ENABLED === 'true';
  }

  // For production: The Vercel Toolbar will automatically
  // only show for team members if enabled in Vercel dashboard
  // You can also check a user session here
  // 
  // Example:
  // const session = useSession();
  // return session?.isTeamMember ?? false;
  
  // For now, return false - enable via Vercel dashboard or auth system
  return false;
}

/**
 * Vercel Toolbar wrapper component
 * 
 * Only renders the toolbar for team members to avoid
 * showing login prompts to regular visitors.
 */
export function VercelToolbarWrapper() {
  const isTeamMember = useIsTeamMember();

  if (!isTeamMember) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <VercelToolbar />
    </Suspense>
  );
}
