import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI, TonConnectButton } from '@tonconnect/ui-react';
import axios from 'axios';
import '../styles/OnboardingPages.css';

const pages = [
  {
    title: "Добро пожаловать в Rebalancer",
    description: "Выполняйте задания, получайте вознаграждения, включайте майнинг для генерации прибыли и наслаждайтесь ежедневными airdrop-ами.",
    buttonText: "Продолжить"
  },
  {
    title: "Реинвестируйте заработанное",
    description: "Увеличьте свой крипто-заработок, занимайтесь стейкингом и фармингом, получая доход до 300% более.",
    buttonText: "Продолжить"
  },
  {
    title: "Инвестиционная платформа на TON",
    description: "Rebalancer — генерирующий комиссии жетон в пулах ликвидности за счет ребалансировки. Инвестируя в Rebalancer вы инвестируете в ТОП проектов TON.",
    buttonText: "Подключить кошелек"
  }
];

const OnboardingPages: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = tonConnectUI.connected;
      if (isConnected) {
        navigate('/main-menu');
      }
    };
    checkConnection();
  }, [tonConnectUI, navigate]);

  const handleContinue = async () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // На последней странице просто показываем кнопку подключения кошелька
      // Логика подключения будет обрабатываться компонентом TonConnectButton
    }
  };

  const handleWalletConnected = async (wallet: any) => {
    try {
      // TODO: Удалить этот блок кода при развертывании в продакшн
      const fakeUserId = 'fake-user-id-' + Math.random().toString(36).substr(2, 9);
      
      // Отправка данных на бэкенд
      const response = await axios.post('/api/auth/connect-wallet', {
        telegramId: fakeUserId, // В продакшн заменить на реальный Telegram ID
        walletAddress: wallet.account.address
      });
      
      if (response.data.success) {
        navigate('/main-menu');
      } else {
        console.error('Failed to save wallet:', response.data.error);
      }
    } catch (error) {
      console.error('Failed to process wallet connection:', error);
    }
  };

  const handleSkip = () => {
    navigate('/main-menu');
  };

  const page = pages[currentPage];

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <img
          src="/safe.png"
          alt="Rebalancer Logo"
          className="onboarding-logo"
        />
        <h1 className="onboarding-title">{page.title}</h1>
        <p className="onboarding-description">{page.description}</p>
      </div>
      <div className="onboarding-buttons">
        {currentPage < pages.length - 1 ? (
          <button onClick={handleContinue} className="onboarding-button-primary">
            {page.buttonText}
          </button>
        ) : (
          <TonConnectButton onWalletConnected={handleWalletConnected} />
        )}
        <button onClick={handleSkip} className="onboarding-button-secondary">
          Пропустить
        </button>
      </div>
    </div>
  );
};

export default OnboardingPages;