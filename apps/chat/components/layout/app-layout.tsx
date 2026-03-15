'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useUiStore } from '@/stores/ui-store';
import { UpgradeModal } from '@/components/modals/upgrade-modal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const upgradeModalOpen = useUiStore((s) => s.upgradeModalOpen);
  const closeUpgradeModal = useUiStore((s) => s.closeUpgradeModal);
  const pathname = usePathname();

  const isChatPage = pathname.startsWith('/chat') || pathname === '/';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
      {/* Sidebar — always rendered so the mobile sheet is accessible from any page */}
      <Sidebar showOnDesktop={isChatPage} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={(open) => !open && closeUpgradeModal()}
      />
    </div>
  );
}
