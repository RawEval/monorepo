import { redirect } from 'next/navigation';

export default function HomePage() {
  // Middleware handles auth check:
  // - Authenticated → this runs → redirect to /chat
  // - Unauthenticated → middleware redirects to /login before this runs
  redirect('/chat');
}
