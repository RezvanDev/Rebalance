import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useActions } from "../hooks/useActions";
import { useTypeSelector } from "../hooks/useTypeSelector";

const MainMenu: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { connected, connectWallet, walletAddress, wallet } = useTonConnect();
  const { tg, user } = useTelegram();
  const { transactions } = useTransactions();
  const { fetchUser } = useActions();
  const [showNotification, setShowNotification] = useState(false);
  const { userData } = useTypeSelector((state) => state.user);
  
  useEffect(() => {
    if (tg) {
      tg.BackButton.hide();
    }
  }, [tg]);
  
  const addUser = async () => {
    const walletAddress = tonConnectUI.account?.address;
    //создание пользователя
    try {
      const response = await axios
        .post(`${BASE_URL}/api/auth/register`, null, {
          params: {
            telegramId: user?.id,
            username: user?.username,
            firstName: user?.username,
            lastName: user?.username,
            referredById: user?.id,
            walletAddress,
          },
        })
        .then((response) => console.log(response.data))
        .catch((err) => console.log(err));
        
        fetchUser (walletAddress)
        return response;
    } catch (error) {
      console.log("Error sending wallet data:", error);
    }
  };

  useEffect(() => {
    if (connected) {
      console.log("Wallet connected successfully");
      fetchUser (wallet?.address)
    }
  }, [connected]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      await addUser();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleInvite = () => {
    const referralLink = `https://t.me/your_bot?start=REF${user?.id}`;
    console.log("Попытка шаринга. Реферальная ссылка:", referralLink);

    if (window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      console.log("Используем openTelegramLink");
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`
      );
    } else if (window.Telegram.WebApp && window.Telegram.WebApp.shareUrl) {
      console.log("Используем WebApp.shareUrl");
      window.Telegram.WebApp.shareUrl(referralLink);
    } else if (tg && tg.shareUrl) {
      console.log("Используем tg.shareUrl");
      tg.shareUrl(referralLink);
    } else if (navigator.share) {
      console.log("Используем navigator.share");
      navigator
        .share({
          title: "Приглашение",
          text: `Присоединяйтесь к нашему боту по этой ссылке: ${referralLink}`,
          url: referralLink,
        })
        .then(() => {
          console.log("Успешно поделились");
        })
        .catch((error) => {
          console.log("Ошибка шаринга", error);
          handleCopyReferralLink();
        });
    } else {
      console.log("Методы шаринга недоступны, копируем ссылку");
      handleCopyReferralLink();
    }
  };

  const handleCopyReferralLink = () => {
    const referralLink = `https://t.me/your_bot?start=REF${user?.id}`;
    console.log("Копирование ссылки:", referralLink);
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        console.log("Ссылка успешно скопирована");
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
        <p className="balance-amount">{userData?.balance} REBA</p>
        <p className="balance-change">↑ 6,18% • $10,34</p>
        <p className="wallet-label">Кошелек</p>
        <p className="wallet-address">{walletAddress ? walletAddress : ""}</p>
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
            <p className="referrals-count">0</p>
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
                <td className="table-cell">0</td>
                <td className="table-cell">0 REBA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="list-title">Как купить или продать LIBRA?</h3>
        <ol className="ordered-list">
          <li>Перейти в Dedust.io</li>
          <li>Подключите свой кошелёк</li>
          <li>Перейдите в раздел «Swap»</li>
          <li>Обменяйте LIBRA на другую монету или другую монету на LIBRA</li>
          <li>
            LIBRA можно купить или продать только за другие токены. Мы
            рекомендуем использовать TON.
          </li>
        </ol>
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
