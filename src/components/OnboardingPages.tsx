import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnect } from '../hooks/useTonConnect';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { connectWallet as apiConnectWallet } from '../services/api';
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
  const { connected, account } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<string | null>(null);

  useEffect(() => {
    const storedTelegramId = localStorage.getItem('telegramId');
    const webAppTelegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    
    if (storedTelegramId) {
      setTelegramId(storedTelegramId);
    } else if (webAppTelegramId) {
      setTelegramId(webAppTelegramId.toString());
      localStorage.setItem('telegramId', webAppTelegramId.toString());
    } else {
      console.warn('Telegram ID not found. Using test ID.');
      const testTelegramId = '123456789';
      setTelegramId(testTelegramId);
      localStorage.setItem('telegramId', testTelegramId);
    }
  }, []);

  useEffect(() => {
    if (connected && account?.address) {
      saveWalletAddress(account.address);
    }
  }, [connected, account]);

  const handleContinue = async () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      try {
        console.log('Attempting to connect wallet...');
        await tonConnectUI.connectWallet();
        console.log('Wallet connection initiated');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setError('Не удалось подключить кошелек. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const saveWalletAddress = async (address: string) => {
    if (!telegramId) {
      setError('Telegram ID не доступен. Невозможно сохранить адрес кошелька.');
      return;
    }

    try {
      await apiConnectWallet(telegramId, address);
      console.log('Wallet address saved successfully');
      navigate('/main-menu');
    } catch (error) {
      console.error('Failed to save wallet address:', error);
      setError('Не удалось сохранить адрес кошелька. Пожалуйста, попробуйте еще раз.');
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
        {error && <p className="onboarding-error">{error}</p>}
      </div>
      <div className="onboarding-buttons">
        <button onClick={handleContinue} className="onboarding-button-primary">
          {page.buttonText}
        </button>
        {currentPage < pages.length - 1 && (
          <button onClick={handleSkip} className="onboarding-button-secondary">
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPages;