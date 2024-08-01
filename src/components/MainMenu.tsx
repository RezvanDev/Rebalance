import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnect } from '../hooks/useTonConnect';
import { useTelegram } from '../context/TelegramContext';
import { useBalance } from '../context/BalanceContext';
import { useTransactions } from '../hooks/useTransactions';
import { useReferrals } from '../hooks/useReferrals';
import { referralLevels } from '../utils/referralSystem';
import '../styles/MainMenu.css';
import backgroundVideo from '../assets/video.mp4';
import tonIcon from '../assets/ton.svg'; 

const MainMenu: React.FC = () => {
  const { wallet, connected, connectWallet } = useTonConnect();
  const { balance, updateBalance, error: balanceError } = useBalance();
  const { tg, user } = useTelegram();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);

  const { referrals, totalEarnings, error: referralsError, isLoading } = useReferrals(user?.id);

  useEffect(() => {
    if (connected) {
      console.log('Wallet connected successfully');
    }
  }, [connected]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleInvite = () => {
    if (!user?.id) {
      console.error('User ID is not available');
      return;
    }
    const referralLink = `https://t.me/your_bot?start=REF${user.id}`;
    console.log("Попытка шаринга. Реферальная ссылка:", referralLink);

    if (window.Telegram?.WebApp?.openTelegramLink) {
      console.log("Используем openTelegramLink");
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`);
    } else if (window.Telegram?.WebApp?.shareUrl) {
      console.log("Используем WebApp.shareUrl");
      window.Telegram.WebApp.shareUrl(referralLink);
    } else if (tg?.shareUrl) {
      console.log("Используем tg.shareUrl");
      tg.shareUrl(referralLink);
    } else if (navigator.share) {
      console.log("Используем navigator.share");
      navigator.share({
        title: 'Приглашение',
        text: `Присоединяйтесь к нашему боту по этой ссылке: ${referralLink}`,
        url: referralLink,
      }).then(() => {
        console.log('Успешно поделились');
      }).catch((error) => {
        console.log('Ошибка шаринга', error);
        handleCopyReferralLink();
      });
    } else {
      console.log("Методы шаринга недоступны, копируем ссылку");
      handleCopyReferralLink();
    }
  };

  const handleCopyReferralLink = () => {
    if (!user?.id) {
      console.error('User ID is not available');
      return;
    }
    const referralLink = `https://t.me/your_bot?start=REF${user.id}`;
    console.log("Копирование ссылки:", referralLink);
    navigator.clipboard.writeText(referralLink).then(() => {
      console.log("Ссылка успешно скопирована");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }).catch(err => {
      console.error("Ошибка при копировании:", err);
      alert(`Не удалось скопировать ссылку. Вот ваша реферальная ссылка: ${referralLink}`);
    });
  };

  const renderReferralTable = () => {
    return (
      <table className="table">
        <thead>
          <tr className="table-header">
            <th className="table-cell">Уровень</th>
            <th className="table-cell">Процент</th>
            <th className="table-cell">Кол-во</th>
            <th className="table-cell">Награда</th>
          </tr>
        </thead>
        <tbody>
          {referralLevels.map((level) => {
            const levelReferrals = referrals?.filter(r => r.level === level.level) || [];
            const levelEarnings = levelReferrals.reduce((sum, r) => sum + r.earnings, 0);
            return (
              <tr key={level.level} className="table-row">
                <td className="table-cell">{level.level}</td>
                <td className="table-cell">{level.percentage}%</td>
                <td className="table-cell">{levelReferrals.length}</td>
                <td className="table-cell">{levelEarnings.toFixed(2)} REBA</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  return (
    <div className="container">
      {showNotification && (
        <div className="notification">
          Пригласительная ссылка скопирована в буфер обмена
        </div>
      )}
      <div className="balance-card">
        <video autoPlay loop muted playsInline>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <h2 className="balance-title">Баланс</h2>
        <p className="balance-amount">{balance} REBA</p>
        {balanceError && <p className="error-message">{balanceError}</p>}
        <p className="balance-change">↑ 6,18% • $10,34</p>
        <p className="wallet-label">Кошелек</p>
        <p className="wallet-address">
          {wallet ? wallet.address : ''}
        </p>
        {connected ? (
          <button className="withdraw-button">
            <span style={{marginRight: '5px'}}>↑</span> Вывод
          </button>
        ) : (
          <button className="connect-wallet-button" onClick={handleConnectWallet}>
            <img src={tonIcon} alt="TON" className="ton-icon" />
            Подключить кошелек
          </button>
        )}
      </div>

      <div className="card">
        <div className="referrals-header">
          <div>
            <h3 className="referrals-title">Рефералы</h3>
            <p className="referrals-count">{referrals?.length || 0}</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="invite-button" onClick={handleInvite}>Пригласить</button>
            <button className="copy-button" onClick={handleCopyReferralLink}>⧉</button>
          </div>
        </div>
        {isLoading ? (
          <p>Загрузка данных о рефералах...</p>
        ) : (
          <>
            {referralsError && <p className="error-message">Ошибка: {referralsError}</p>}
            {renderReferralTable()}
          </>
        )}
        <p className="total-earnings">Общий заработок: {totalEarnings.toFixed(2)} REBA</p>
      </div>

      <div className="card">
        <h3 className="list-title">Как купить или продать REBA?</h3>
        <ol className="ordered-list">
          <li>Перейти в Dedust.io</li>
          <li>Подключите свой кошелёк</li>
          <li>Перейдите в раздел «Swap»</li>
          <li>Обменяйте REBA на другую монету или другую монету на REBA</li>
          <li>REBA можно купить или продать только за другие токены. Мы рекомендуем использовать TON.</li>
        </ol>
      </div>

      <div className="card">
        <h3 className="list-title">История транзакций</h3>
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction.id} className="transaction">
              <span className={`transaction-type ${transaction.type === 'Получение' ? 'transaction-receive' : 'transaction-withdraw'}`}>
                {transaction.type}
              </span>
              <span className="transaction-amount">{transaction.amount}</span>
              <span className="transaction-date">{new Date(transaction.date).toLocaleString()}</span>
              <span className="transaction-description">{transaction.description}</span>
            </div>
          ))
        ) : (
          <p>Нет транзакций для отображения</p>
        )}
      </div>
    </div>
  );
};

export default MainMenu;