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
  return (
    <Suspense fallback={null}>
      <VercelToolbar />
    </Suspense>
  );
}
