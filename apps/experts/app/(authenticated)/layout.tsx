import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: 'var(--nav-height, 56px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
