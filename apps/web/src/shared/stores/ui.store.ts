import { create } from 'zustand';

/**
 * Client-only UI state. Server data never lives here: it belongs to TanStack Query
 * (ADR 0015). Add a slice only for state no server knows about.
 */
interface UiState {
  /** The verification banner was dismissed for this browser session. */
  verificationBannerDismissed: boolean;
  dismissVerificationBanner: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  verificationBannerDismissed: false,
  dismissVerificationBanner: () => set({ verificationBannerDismissed: true }),
}));
