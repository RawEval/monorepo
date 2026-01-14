'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to authenticated chat interface
    // In production, check auth and redirect accordingly
    // For now, always redirect to authenticated chat
    router.push('/chat');
  }, [router]);

  return null;
}
