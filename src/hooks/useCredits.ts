import { useState, useEffect } from 'react';

const STORAGE_KEY = 'gfkcoach_credits';
const INITIAL_CREDITS = 5;

export function useCredits() {
  const [credits, setCredits] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : INITIAL_CREDITS;
  });

  const [hasReceivedBonusCredits, setHasReceivedBonusCredits] = useState(() => {
    return localStorage.getItem('bonus_credits_received') === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, credits.toString());
  }, [credits]);

  const useCredit = () => {
    setCredits(prev => Math.max(0, prev - 1));
  };

  const addCredits = (amount: number) => {
    setCredits(prev => prev + amount);
    if (!hasReceivedBonusCredits) {
      localStorage.setItem('bonus_credits_received', 'true');
      setHasReceivedBonusCredits(true);
    }
  };

  return {
    credits,
    useCredit,
    addCredits,
    hasReceivedBonusCredits
  };
}