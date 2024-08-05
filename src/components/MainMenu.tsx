import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import axios from 'axios';

const MainMenu: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [walletAddress, setWalletAddress] = useState('');
  const [internalBalance, setInternalBalance] = useState('');
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (tonConnectUI.account?.address) {
        setLoading(true);
        setError('');
        try {
          // Получаем данные пользователя Telegram
          const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
          if (tgUser) {
            setTelegramUser(tgUser);
          } else {
            throw new Error('Telegram user data not available');
          }

          // Получаем информацию о пользователе с бэкенда
          const userResponse = await axios.get(`/api/auth/user/${tgUser.id}`);
          if (userResponse.data.success) {
            setWalletAddress(userResponse.data.user.walletAddress);
            setInternalBalance(userResponse.data.user.balance.toString());
          } else {
            throw new Error(userResponse.data.error || 'Failed to fetch user info');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          setError('Ошибка при получении информации о пользователе: ' + (error.message || 'Unknown error'));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserInfo();
  }, [tonConnectUI.account]);

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
      setWalletAddress('');
      setInternalBalance('');
      setTelegramUser(null);
      setError('');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Ошибка при отключении кошелька');
    }
  };

  return (
    <div className="main-menu">
      <h1>Главное меню</h1>
      <p>Добро пожаловать в Rebalancer!</p>
      
      {loading && <p>Загрузка...</p>}
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {telegramUser && (
        <div>
          <p>Имя пользователя: {telegramUser.username}</p>
          <p>Имя: {telegramUser.first_name}</p>
          <p>Фамилия: {telegramUser.last_name}</p>
        </div>
      )}
      
      {walletAddress && (
        <div>
          <p>Адрес кошелька: {walletAddress}</p>
          <p>Баланс внутренней валюты: {internalBalance}</p>
        </div>
      )}
      
      {tonConnectUI.connected && (
        <button onClick={handleDisconnect}>Отключить кошелек</button>
      )}
    </div>
  );
};

export default MainMenu;