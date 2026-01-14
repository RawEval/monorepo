'use client';

import { Sidebar } from './sidebar';
import { ProjectsSidebar } from './projects-sidebar';
import { UpgradeModal } from '@/components/modals/upgrade-modal';
import { useUiStore } from '@/stores/ui-store';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useUiStore((s) => s.rightSidebarOpen);
  const upgradeModalOpen = useUiStore((s) => s.upgradeModalOpen);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useUiStore((s) => s.toggleRightSidebar);
  const closeUpgradeModal = useUiStore((s) => s.closeUpgradeModal);

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar isOpen={leftSidebarOpen} onToggle={toggleLeftSidebar} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Right Sidebar - Projects */}
      <ProjectsSidebar
        isOpen={rightSidebarOpen}
        onToggle={toggleRightSidebar}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={(open) => !open && closeUpgradeModal()}
      />
    </div>
  );
}
