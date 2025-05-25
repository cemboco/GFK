import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'gfkcoach_credits';
const INITIAL_CREDITS = 5;
const SIGNUP_BONUS_CREDITS = 5;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useCredits() {
  const [credits, setCredits] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : INITIAL_CREDITS;
  });

  const [hasReceivedBonusCredits, setHasReceivedBonusCredits] = useState(() => {
    return localStorage.getItem('bonus_credits_received') === 'true';
  });

  useEffect(() => {
    const checkAuthAndCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has received signup bonus
        const { data: creditHistory } = await supabase
          .from('user_credit_history')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'bonus')
          .eq('description', 'Anmeldebonus')
          .maybeSingle();

        if (creditHistory === null) {
          // Add signup bonus credits
          await supabase.from('user_credit_history').insert([{
            user_id: user.id,
            amount: SIGNUP_BONUS_CREDITS,
            type: 'bonus',
            description: 'Anmeldebonus'
          }]);
          
          setCredits(prev => prev + SIGNUP_BONUS_CREDITS);
        }
      }
    };

    checkAuthAndCredits();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, credits.toString());
  }, [credits]);

  const useCredit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    setCredits(prev => Math.max(0, prev - 1));

    if (user) {
      await supabase.from('user_credit_history').insert([{
        user_id: user.id,
        amount: -1,
        type: 'usage',
        description: 'GFK-Transformation'
      }]);
    }
  };

  const addCredits = async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    setCredits(prev => prev + amount);
    
    if (user) {
      await supabase.from('user_credit_history').insert([{
        user_id: user.id,
        amount: amount,
        type: 'bonus',
        description: 'Bonus Credits'
      }]);
    }

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