import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BillingCycle = 'monthly' | 'annually';

interface UiState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  upgradeModalOpen: boolean;
  billingCycle: BillingCycle;
}

interface UiActions {
  toggleLeftSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const useUiStore = create<UiState & UiActions>()(
  persist(
    (set) => ({
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      upgradeModalOpen: false,
      billingCycle: 'annually',

      toggleLeftSidebar: () =>
        set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
      toggleRightSidebar: () =>
        set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
      setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),

      openUpgradeModal: () => set({ upgradeModalOpen: true }),
      closeUpgradeModal: () => set({ upgradeModalOpen: false }),

      setBillingCycle: (cycle) => set({ billingCycle: cycle }),
    }),
    {
      name: 'raweval-chat-ui',
      partialize: (s) => ({
        leftSidebarOpen: s.leftSidebarOpen,
        rightSidebarOpen: s.rightSidebarOpen,
        billingCycle: s.billingCycle,
      }),
    }
  )
);

