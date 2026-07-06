declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
    __streleEmbedTap?: number;
    __streleDaysOverlay?: number;
    __wPR?: number;
  }
}

export {};
