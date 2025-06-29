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

  useEffect(() => {
    if (user) {
      initializeChatUsage();
    } else {
      setChatUsage(null);
      setIsLoading(false);
    }
  }, [user]);

  const initializeChatUsage = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has chat usage record
      const { data: existingUsage, error: fetchError } = await supabase
        .from('chat_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let usageData;

      if (!existingUsage) {
        // Create new chat usage record
        const { data: newUsage, error: createError } = await supabase
          .from('chat_usage')
          .insert([{
            user_id: user.id,
            message_count: 0,
            max_messages: 3,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          }])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        usageData = newUsage;
      } else {
        // Check if reset date has passed
        const resetDate = new Date(existingUsage.reset_date);
        const now = new Date();

        if (now > resetDate) {
          // Reset the counter
          const { data: resetUsage, error: resetError } = await supabase
            .from('chat_usage')
            .update({
              message_count: 0,
              reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();

          if (resetError) {
            throw resetError;
          }

          usageData = resetUsage;
        } else {
          usageData = existingUsage;
        }
      }

      setChatUsage({
        messageCount: usageData.message_count,
        maxMessages: usageData.max_messages,
        remainingMessages: usageData.max_messages - usageData.message_count,
        resetDate: new Date(usageData.reset_date),
        canSendMessage: usageData.message_count < usageData.max_messages
      });

    } catch (error) {
      console.error('Error initializing chat usage:', error);
      // Fallback to default values
      setChatUsage({
        messageCount: 0,
        maxMessages: 3,
        remainingMessages: 3,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        canSendMessage: true
      });
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
        .update({ message_count: newCount })
        .eq('user_id', user.id);

      if (error) {
        throw error;
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

  return {
    chatUsage,
    isLoading,
    incrementMessageCount,
    getUpgradeMessage
  };
}; 