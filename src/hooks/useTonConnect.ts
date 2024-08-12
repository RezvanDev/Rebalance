import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useBalance } from '../context/BalanceContext';
import { useEffect } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const { balance, updateBalance } = useBalance();
  const  wallet = useTonWallet()
  const address = useTonAddress();

  useEffect(() => {
    if (tonConnectUI.account?.balance) {
      updateBalance(tonConnectUI.account.balance);
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
      } catch (e) {
        console.error(e);
        throw new Error('Failed to connect wallet');
      }
    },
    disconnectWallet: () => tonConnectUI.disconnect(),
  };
}