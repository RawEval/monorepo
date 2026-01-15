'use client';

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar - Chat List */}
      <Sidebar />

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
