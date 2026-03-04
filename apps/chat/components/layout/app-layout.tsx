'use client';

import { Header } from './header';
import { Sidebar } from './sidebar';
import { useUiStore } from '@/stores/ui-store';
import { UpgradeModal } from '@/components/modals/upgrade-modal';

interface AppLayoutProps {
  children: React.ReactNode;
}

import { usePathname } from 'next/navigation';

export function AppLayout({ children }: AppLayoutProps) {
  const upgradeModalOpen = useUiStore((s) => s.upgradeModalOpen);
  const closeUpgradeModal = useUiStore((s) => s.closeUpgradeModal);
  const pathname = usePathname();

  const isChatPage = pathname.startsWith('/chat') || pathname === '/';

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Left Sidebar - Chat List */}
      {isChatPage && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Chat Interface */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={(open) => !open && closeUpgradeModal()}
      />
    </div>
  );
}
