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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: creditHistory, error } = await supabase
            .from('user_credit_history')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'bonus')
            .eq('description', 'Registrierungsbonus')
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking credit history:', error);
            return;
          }

          if (!creditHistory) {
            const { error: insertError } = await supabase
              .from('user_credit_history')
              .insert([{
                user_id: user.id,
                amount: SIGNUP_BONUS_CREDITS,
                type: 'bonus',
                description: 'Registrierungsbonus'
              }]);

            if (insertError) {
              console.error('Error adding signup bonus:', insertError);
              return;
            }
            
            setCredits(prev => prev + SIGNUP_BONUS_CREDITS);
          }
        }
      } catch (err) {
        console.error('Error in checkAuthAndCredits:', err);
      }
    };

    checkAuthAndCredits();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, credits.toString());
  }, [credits]);

  const useCredit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      setCredits(prev => Math.max(0, prev - 1));

      if (user) {
        const { error } = await supabase
          .from('user_credit_history')
          .insert([{
            user_id: user.id,
            amount: -1,
            type: 'usage',
            description: 'GFK-Transformation'
          }]);

        if (error) {
          console.error('Error recording credit usage:', error);
        }
      }
    } catch (err) {
      console.error('Error in useCredit:', err);
    }
  };

  const addCredits = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      setCredits(prev => prev + amount);
      
      if (user) {
        const { error } = await supabase
          .from('user_credit_history')
          .insert([{
            user_id: user.id,
            amount: amount,
            type: 'bonus',
            description: 'Bonus Credits'
          }]);

        if (error) {
          console.error('Error recording bonus credits:', error);
        }
      }

      if (!hasReceivedBonusCredits) {
        localStorage.setItem('bonus_credits_received', 'true');
        setHasReceivedBonusCredits(true);
      }
    } catch (err) {
      console.error('Error in addCredits:', err);
    }
  };

  return {
    credits,
    useCredit,
    addCredits,
    hasReceivedBonusCredits
  };
}