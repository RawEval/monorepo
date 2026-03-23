import { create } from 'zustand';

export type BillingCycle = 'monthly' | 'annually';

interface UiState {
  upgradeModalVisible: boolean;
  earnModalVisible: boolean;
  billingCycle: BillingCycle;
  markWrongModalVisible: boolean;
  markWrongMessageId: string | null;
}

interface UiActions {
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  openEarnModal: () => void;
  closeEarnModal: () => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  openMarkWrongModal: (messageId: string) => void;
  closeMarkWrongModal: () => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  upgradeModalVisible: false,
  earnModalVisible: false,
  billingCycle: 'annually',
  markWrongModalVisible: false,
  markWrongMessageId: null,

  openUpgradeModal: () => set({ upgradeModalVisible: true }),
  closeUpgradeModal: () => set({ upgradeModalVisible: false }),

  openEarnModal: () => set({ earnModalVisible: true }),
  closeEarnModal: () => set({ earnModalVisible: false }),

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),

  openMarkWrongModal: (messageId) =>
    set({ markWrongModalVisible: true, markWrongMessageId: messageId }),
  closeMarkWrongModal: () =>
    set({ markWrongModalVisible: false, markWrongMessageId: null }),
}));
