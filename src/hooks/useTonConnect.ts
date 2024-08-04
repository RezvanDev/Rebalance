import { useTonConnectUI } from '@tonconnect/ui-react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();

  return {
    connected: tonConnectUI.connected,
    account: tonConnectUI.account,
    connectWallet: async () => {
      if (!tonConnectUI.connected) {
        try {
          await tonConnectUI.connectWallet();
        } catch (e) {
          console.error(e);
        }
      }
    },
    disconnectWallet: () => {
      if (tonConnectUI.connected) {
        tonConnectUI.disconnect();
      }
    },
  };
}