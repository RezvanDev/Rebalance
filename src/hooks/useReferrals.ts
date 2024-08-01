import { useState, useEffect } from 'react';
import { useTelegram } from '../context/TelegramContext';

interface Referral {
  id: string;
  level: number;
  earnings: number;
}

interface ReferralData {
  referrals: Referral[];
  totalEarnings: number;
}

export const useReferrals = () => {
  const [referralData, setReferralData] = useState<ReferralData>({ referrals: [], totalEarnings: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useTelegram();

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?.id) {
        setError('User ID is not available');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referrals/user/${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched referral data:', data);
        setReferralData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, [user]);

  return {
    referrals: referralData.referrals,
    totalEarnings: referralData.totalEarnings,
    error,
    isLoading
  };
};