import React, { useState, useEffect, useCallback } from "react";
import { useTonConnect } from "../hooks/useTonConnect";
import { useTelegram } from "../context/TelegramContext";
import { useTransactions } from "../hooks/useTransactions";
import { useBalance } from "../context/BalanceContext";
import "../styles/MainMenu.css";
import backgroundVideo from "../assets/video.mp4";
import tonIcon from "../assets/ton.svg";
import { taskApi } from "../api/taskApi";

interface ReferralData {
  level: number;
  percentage: number;
  count: number;
  reward: number;
}

const MainMenu: React.FC = () => {
  const { connected, connectWallet, walletAddress } = useTonConnect();
  const { tg, user } = useTelegram();
  const { transactions } = useTransactions();
  const { balance, fetchBalance } = useBalance();
  const [referralData, setReferralData] = useState<ReferralData[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalReferralEarnings, setTotalReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  useEffect(() => {
    if (tg) {
      tg.BackButton.hide();
    }
    fetchBalance();
    if (user?.id) {
      fetchReferralCode();
    }
  }, [tg, fetchBalance, user]);
  
  const fetchReferralCode = async () => {
    if (!user?.id) return;
    try {
      const response = await taskApi.getReferralCode(String(user.id));
      setReferralCode(response.referralCode);
    } catch (error) {
      console.error("Error fetching referral code:", error);
    }
  };
  
  const fetchReferralData = useCallback(async () => {
    if (!user?.id) {
      setError("User information is not available");
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      const [referralsResponse, earningsResponse] = await Promise.all([
        taskApi.getReferrals(String(user.id)),
        taskApi.getTotalReferralEarnings(String(user.id))
      ]);
      console.log("Received referral data:", referralsResponse);
      console.log("Received total referral earnings:", earningsResponse);
  
      if (referralsResponse.success) {
        const formattedData = Object.entries(referralsResponse.referralsByLevel).map(([level, count]) => ({
          level: Number(level),
          percentage: referralsResponse.percentages[level],
          count: count as number,
          reward: referralsResponse.rewardsByLevel[level] || 0
        }));
        setReferralData(formattedData);
        setTotalReferrals(referralsResponse.referralsCount);
        setTotalReferralEarnings(earningsResponse.totalReferralEarnings);
      } else {
        setError(referralsResponse.error || "Ошибка при загрузке данных о рефералах");
      }
    } catch (error) {
      setError(`Произошла ошибка при загрузке данных: ${error.message}`);
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (connected && user?.id) {
      console.log("Fetching referral data for user:", user.id);
      fetchReferralData();
    } else {
      console.log("Not fetching referral data. Connected:", connected, "User ID:", user?.id);
    }
  }, [connected, user, fetchReferralData]);

  useEffect(() => {
    const intervalId = setInterval(fetchBalance, 10000);
    return () => clearInterval(intervalId);
  }, [fetchBalance]);

  const handleInvite = () => {
    if (!referralCode) {
      console.error("Referral code not available");
      return;
    }
    const referralLink = `https://t.me/fmkffjkfmbot?start=${referralCode}`;
    console.log("Попытка шаринга. Реферальная ссылка:", referralLink);

    if (window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`
      );
    } else if (window.Telegram.WebApp && window.Telegram.WebApp.shareUrl) {
      window.Telegram.WebApp.shareUrl(referralLink);
    } else if (tg && tg.shareUrl) {
      tg.shareUrl(referralLink);
    } else if (navigator.share) {
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
      handleCopyReferralLink();
    }
  };

  const handleCopyReferralLink = () => {
    if (!referralCode) {
      console.error("Referral code not available");
      return;
    }
    const referralLink = `https://t.me/fmkffjkfmbot?start=${referralCode}`;
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
        <p className="balance-amount">{balance} REBA</p>
        <p className="wallet-label">Кошелек</p>
        <p className="wallet-address">{walletAddress || ""}</p>
        {connected ? (
          <button className="withdraw-button">
            <span style={{ marginRight: "5px" }}>↑</span> Вывод
          </button>
        ) : (
          <button
            className="connect-wallet-button"
            onClick={connectWallet}
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
            <p className="referrals-count">Всего: {totalReferrals}</p>
            <p className="referrals-earnings">Заработано: {totalReferralEarnings} REBA</p>
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
        {loading ? (
          <p>Загрузка данных о рефералах...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
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
              {referralData.map((data) => (
                <tr key={data.level} className="table-row">
                  <td className="table-cell">{data.level}</td>
                  <td className="table-cell">{data.percentage}%</td>
                  <td className="table-cell">{data.count}</td>
                  <td className="table-cell">{data.reward} REBA</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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