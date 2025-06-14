import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserSession {
  id: string;
  type: 'authenticated' | 'anonymous' | 'ip_fallback';
  usageCount: number;
  maxUsage: number;
}

export function useUserTracking() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate anonymous user ID
  const getAnonymousUserId = (): string => {
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('anonymous_user_id', userId);
    }
    return userId;
  };

  // Generate browser fingerprint as fallback
  const getBrowserFingerprint = (): string => {
    const fingerprint = btoa(JSON.stringify({
      userAgent: navigator.userAgent.slice(0, 100), // Truncate for privacy
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }));
    return fingerprint;
  };

  // Get client IP as last resort
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Authenticated user - unlimited usage
        const userSession = await getAuthenticatedUserSession(user.id);
        setSession(userSession);
      } else {
        // Anonymous user - try different tracking methods
        const anonymousSession = await getAnonymousUserSession();
        setSession(anonymousSession);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthenticatedUserSession = async (userId: string): Promise<UserSession> => {
    // Get usage count from messages table
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user messages:', error);
    }

    return {
      id: userId,
      type: 'authenticated',
      usageCount: messages?.length || 0,
      maxUsage: -1 // Unlimited for authenticated users
    };
  };

  const getAnonymousUserSession = async (): Promise<UserSession> => {
    // Try anonymous user ID first
    const anonymousId = getAnonymousUserId();
    
    let sessionData = await checkAnonymousUsage(anonymousId, 'anonymous');
    if (sessionData) {
      return sessionData;
    }

    // Fallback to browser fingerprint
    const fingerprint = getBrowserFingerprint();
    sessionData = await checkAnonymousUsage(fingerprint, 'anonymous');
    if (sessionData) {
      return sessionData;
    }

    // Last resort: IP address
    const ip = await getClientIP();
    sessionData = await checkAnonymousUsage(ip, 'ip_fallback');
    
    return sessionData || {
      id: anonymousId,
      type: 'anonymous',
      usageCount: 0,
      maxUsage: 5
    };
  };

  const checkAnonymousUsage = async (
    identifier: string, 
    type: 'anonymous' | 'ip_fallback'
  ): Promise<UserSession | null> => {
    try {
      const tableName = type === 'ip_fallback' ? 'ip_usage' : 'anonymous_usage';
      const columnName = type === 'ip_fallback' ? 'ip' : 'identifier';

      const { data, error } = await supabase
        .from(tableName)
        .select('usage_count')
        .eq(columnName, identifier)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error(`Error checking ${type} usage:`, error);
        return null;
      }

      return {
        id: identifier,
        type,
        usageCount: data?.usage_count || 0,
        maxUsage: 5
      };
    } catch (error) {
      console.error(`Error in checkAnonymousUsage for ${type}:`, error);
      return null;
    }
  };

  const canUseService = (): boolean => {
    if (!session) return false;
    if (session.type === 'authenticated') return true;
    return session.usageCount < session.maxUsage;
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (!session || !canUseService()) return false;

    try {
      if (session.type === 'authenticated') {
        // For authenticated users, usage is tracked via messages table
        // No need to increment separately
        setSession(prev => prev ? { ...prev, usageCount: prev.usageCount + 1 } : null);
        return true;
      } else {
        // For anonymous users, update usage tracking
        const tableName = session.type === 'ip_fallback' ? 'ip_usage' : 'anonymous_usage';
        const columnName = session.type === 'ip_fallback' ? 'ip' : 'identifier';

        const { error } = await supabase
          .from(tableName)
          .upsert({
            [columnName]: session.id,
            usage_count: session.usageCount + 1,
            last_used: new Date().toISOString()
          });

        if (error) {
          console.error('Error incrementing usage:', error);
          return false;
        }

        setSession(prev => prev ? { ...prev, usageCount: prev.usageCount + 1 } : null);
        return true;
      }
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  };

  const getRemainingUsage = (): number => {
    if (!session) return 0;
    if (session.type === 'authenticated') return -1; // Unlimited
    return Math.max(0, session.maxUsage - session.usageCount);
  };

  const getUsageInfo = () => {
    if (!session) return null;

    return {
      type: session.type,
      current: session.usageCount,
      max: session.maxUsage,
      remaining: getRemainingUsage(),
      canUse: canUseService()
    };
  };

  return {
    session,
    isLoading,
    canUseService,
    incrementUsage,
    getRemainingUsage,
    getUsageInfo,
    initializeSession
  };
}