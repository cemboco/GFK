import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';

interface ChatUsage {
  messageCount: number;
  maxMessages: number;
  remainingMessages: number;
  resetDate: Date;
  canSendMessage: boolean;
}

export const useChatUsage = (user: any) => {
  const [chatUsage, setChatUsage] = useState<ChatUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      initializeChatUsage();
    } else {
      setChatUsage(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  const initializeChatUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Test connection first
      const { error: connectionError } = await supabase
        .from('chat_usage')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      // Check if user has chat usage record
      const { data: existingUsage, error: fetchError } = await supabase
        .from('chat_usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to fetch chat usage: ${fetchError.message}`);
      }

      let usageData;

      if (!existingUsage) {
        // Create new chat usage record
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1);

        const { data: newUsage, error: createError } = await supabase
          .from('chat_usage')
          .insert([{
            user_id: user.id,
            message_count: 0,
            max_messages: 3,
            reset_date: resetDate.toISOString()
          }])
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create chat usage record: ${createError.message}`);
        }

        usageData = newUsage;
      } else {
        // Check if reset date has passed
        const resetDate = new Date(existingUsage.reset_date);
        const now = new Date();

        if (now > resetDate) {
          // Reset the counter
          const newResetDate = new Date();
          newResetDate.setMonth(newResetDate.getMonth() + 1);

          const { data: resetUsage, error: resetError } = await supabase
            .from('chat_usage')
            .update({
              message_count: 0,
              reset_date: newResetDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();

          if (resetError) {
            throw new Error(`Failed to reset chat usage: ${resetError.message}`);
          }

          usageData = resetUsage;
        } else {
          usageData = existingUsage;
        }
      }

      setChatUsage({
        messageCount: usageData.message_count || 0,
        maxMessages: usageData.max_messages || 3,
        remainingMessages: (usageData.max_messages || 3) - (usageData.message_count || 0),
        resetDate: new Date(usageData.reset_date),
        canSendMessage: (usageData.message_count || 0) < (usageData.max_messages || 3)
      });

    } catch (error) {
      console.error('Error initializing chat usage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Fallback to default values only if it's not a critical connection error
      if (!errorMessage.includes('Database connection failed')) {
        setChatUsage({
          messageCount: 0,
          maxMessages: 3,
          remainingMessages: 3,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          canSendMessage: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const incrementMessageCount = async () => {
    if (!user || !chatUsage) return false;

    try {
      const newCount = chatUsage.messageCount + 1;
      
      const { error } = await supabase
        .from('chat_usage')
        .update({ 
          message_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to increment message count: ${error.message}`);
      }

      setChatUsage(prev => prev ? {
        ...prev,
        messageCount: newCount,
        remainingMessages: prev.maxMessages - newCount,
        canSendMessage: newCount < prev.maxMessages
      } : null);

      return true;
    } catch (error) {
      console.error('Error incrementing message count:', error);
      setError(error instanceof Error ? error.message : 'Failed to update message count');
      return false;
    }
  };

  const getUpgradeMessage = () => {
    if (!chatUsage) return '';
    
    const daysUntilReset = Math.ceil((chatUsage.resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return `Du hast dein monatliches Limit von ${chatUsage.maxMessages} Nachrichten erreicht. 
    Das Limit wird in ${daysUntilReset} Tagen zurückgesetzt. 
    Bald wird es Premium-Pläne mit mehr Nachrichten geben!`;
  };

  const retryInitialization = () => {
    if (user) {
      initializeChatUsage();
    }
  };

  return {
    chatUsage,
    isLoading,
    error,
    incrementMessageCount,
    getUpgradeMessage,
    retryInitialization
  };
};