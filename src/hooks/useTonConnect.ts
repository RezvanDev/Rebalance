import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useBalanceContext } from '../context/BalanceContext';
import { useEffect } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const { balance, updateBalance, fetchBalance } = useBalanceContext();
  const wallet = useTonWallet();
  const address = useTonAddress();

  useEffect(() => {
    if (tonConnectUI.account?.address) {
      fetchBalance(); // Получаем баланс с сервера при подключении кошелька
    }
  }, [tonConnectUI.account?.address, fetchBalance]);

  useEffect(() => {
    if (tonConnectUI.account?.balance) {
      // Обновляем баланс TON в кошельке, если он изменился
      updateBalance(Number(tonConnectUI.account.balance), 'add');
    }
  }, [tonConnectUI.account?.balance, updateBalance]);

  return {
    name: wallet?.name,
    connected: tonConnectUI.connected,
    wallet: tonConnectUI.account,
    walletAddress: address,
    balance: balance,
    connectWallet: async () => {
      if (tonConnectUI.connected) {
        return; // Already connected
      }
      try {
        await tonConnectUI.connectWallet();
        await fetchBalance(); // Получаем баланс сразу после подключения
      } catch (e) {
        console.error(e);
        throw new Error('Failed to connect wallet');
      }
    },
    disconnectWallet: () => tonConnectUI.disconnect(),
  };
}