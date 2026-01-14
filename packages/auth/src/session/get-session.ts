import type { Session } from '@raweval/types';

/**
 * Get session from request (Next.js App Router compatible)
 * 
 * In production, this would:
 * 1. Read session token from cookies
 * 2. Verify JWT signature
 * 3. Check expiration
 * 4. Fetch user data from database
 * 5. Return session object
 * 
 * For now, this is a placeholder that returns null
 * Implement based on your auth provider (NextAuth, Clerk, etc.)
 */
export async function getSession(): Promise<Session | null> {
  // TODO: Implement actual session retrieval
  // Example with NextAuth:
  // const session = await getServerSession(authOptions);
  // if (!session) return null;
  // return { ...session, expiresAt: new Date(session.expires) };
  
  return null;
}

/**
 * Require session - throws if no session
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: Session required');
  }
  return session;
}
