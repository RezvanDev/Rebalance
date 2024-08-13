import React, { useState, useEffect } from "react";
import { useTonConnect } from "../hooks/useTonConnect";
import { useTelegram } from "../context/TelegramContext";
import { useTransactions } from "../hooks/useTransactions";
import { referralLevels } from "../utils/referralSystem";
import "../styles/MainMenu.css";
import backgroundVideo from "../assets/video.mp4";
import tonIcon from "../assets/ton.svg";
import axios from "axios";
import { BASE_URL } from "../constants/baseUrl";
import { useTonConnectUI } from "@tonconnect/ui-react";

const MainMenu: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { connected, connectWallet, walletAddress, wallet } = useTonConnect();
  const { tg, user } = useTelegram();
  const { transactions } = useTransactions();
  const [showNotification, setShowNotification] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    if (tg) {
      tg.BackButton.hide();
    }
  }, [tg]);
  
  useEffect(() => {
    if (connected && wallet?.address) {
      fetchUser(wallet.address);
    }
  }, [connected, wallet?.address]);

  const fetchUser = async (address: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/user-by-address/${address}`);
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleInvite = () => {
    const referralLink = `https://t.me/your_bot?start=REF${user?.id}`;
    if (tg && tg.shareUrl) {
      tg.shareUrl(referralLink);
    } else {
      handleCopyReferralLink();
    }
  };

  const handleCopyReferralLink = () => {
    const referralLink = `https://t.me/your_bot?start=REF${user?.id}`;
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      })
      .catch((err) => {
        console.error("Ошибка при копировании:", err);
        alert(
          `Не удалось скопировать ссылку. Вот ваша реферальная ссылка: ${referralLink}`
        );
      });
  };

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
        <p className="balance-amount">{userData?.balance || 0} REBA</p>
        <p className="wallet-label">Кошелек</p>
        <p className="wallet-address">{walletAddress || ""}</p>
        {connected ? (
          <button className="withdraw-button">
            <span style={{ marginRight: "5px" }}>↑</span> Вывод
          </button>
        ) : (
          <button
            className="connect-wallet-button"
            onClick={handleConnectWallet}
          >
            <img src={tonIcon} alt="TON" className="ton-icon" />
            Подключить кошелек
          </button>
        )}
      </div>

      <div className="card">
        <div className="referrals-header">
          <div>
            <h3 className="referrals-title">Рефералы</h3>
            <p className="referrals-count">{userData?.referralsCount || 0}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="invite-button" onClick={handleInvite}>
              Пригласить
            </button>
            <button className="copy-button" onClick={handleCopyReferralLink}>
              ⧉
            </button>
          </div>
        </div>
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
            {referralLevels.map((level) => (
              <tr key={level.level} className="table-row">
                <td className="table-cell">{level.level}</td>
                <td className="table-cell">{level.percentage}%</td>
                <td className="table-cell">{userData?.referralsByLevel?.[level.level] || 0}</td>
                <td className="table-cell">{userData?.rewardsByLevel?.[level.level] || 0} REBA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="list-title">История транзакций</h3>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction.id} className="transaction">
              <span
                className={`transaction-type ${
                  transaction.type === "Получение"
                    ? "transaction-receive"
                    : "transaction-withdraw"
                }`}
              >
                {transaction.type}
              </span>
              <span className="transaction-amount">{transaction.amount}</span>
              <span className="transaction-date">
                {new Date(transaction.date).toLocaleString()}
              </span>
              <span className="transaction-description">
                {transaction.description}
              </span>
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