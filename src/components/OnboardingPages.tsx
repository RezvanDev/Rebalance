import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnect } from '../hooks/useTonConnect';
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
  const { connectWallet, connected } = useTonConnect();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      navigate('/main-menu');
    }
  }, [connected, navigate]);

  const handleContinue = async () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
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