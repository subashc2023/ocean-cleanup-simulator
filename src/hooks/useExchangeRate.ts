import { useState, useEffect } from 'react';
import { CACHE_DURATION, DEFAULT_EXCHANGE_RATE } from '@/lib/constants';

interface CachedRate {
  rate: number;
  timestamp: number;
}

const getCachedExchangeRate = (): CachedRate | null => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('exchangeRate');
  if (!cached) return null;
  
  try {
    return JSON.parse(cached) as CachedRate;
  } catch {
    return null;
  }
};

const setCachedExchangeRate = (rate: number) => {
  const cacheData: CachedRate = {
    rate,
    timestamp: Date.now()
  };
  localStorage.setItem('exchangeRate', JSON.stringify(cacheData));
};

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      const cached = getCachedExchangeRate();
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        setExchangeRate(cached.rate);
        setIsLoadingRate(false);
        return;
      }

      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const newRate = data.rates.EUR;
        setExchangeRate(newRate);
        setCachedExchangeRate(newRate);
        setIsLoadingRate(false);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        if (cached) {
          setExchangeRate(cached.rate);
        }
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  return { exchangeRate, isLoadingRate };
}; 