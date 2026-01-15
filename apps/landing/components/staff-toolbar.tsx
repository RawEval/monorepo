'use client';

import { Suspense } from 'react';
import { VercelToolbar } from '@vercel/toolbar/next';

/**
 * Vercel Toolbar Component
 * 
 * Conditionally renders the Vercel Toolbar for team members only.
 * This prevents showing login prompts to regular visitors.
 * 
 * Team membership is automatically detected by Vercel Toolbar
 * when enabled in Vercel dashboard settings.
 * 
 * @see https://vercel.com/docs/vercel-toolbar/in-production-and-localhost/add-to-production
 */
export function StaffToolbar() {
  // The Vercel Toolbar automatically handles team member detection
  // when properly configured in Vercel dashboard (Settings → General → Vercel Toolbar)
  // 
  // For more control, you can add authentication checks here:
  // const session = useSession();
  // if (!session?.isTeamMember) return null;
  
  return (
    <Suspense fallback={null}>
      <VercelToolbar />
    </Suspense>
  );
}
