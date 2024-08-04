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
          return tonConnectUI.account?.address; // Возвращаем адрес кошелька после подключения
        } catch (e) {
          console.error('Failed to connect wallet:', e);
          throw e; // Пробрасываем ошибку дальше
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