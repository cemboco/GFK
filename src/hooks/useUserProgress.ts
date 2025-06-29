import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

interface UserProgress {
  total_transformations: number;
  current_level: string;
  level_progress: number;
  last_activity: string;
}

export const useUserProgress = (user: any) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setProgress(data);
      } else {
        // Create initial progress record with upsert to avoid duplicate key errors
        const { data: newProgress, error: insertError } = await supabase
          .from('user_progress')
          .upsert([{
            user_id: user.id,
            total_transformations: 0,
            current_level: 'Anfänger',
            level_progress: 0,
            last_activity: new Date().toISOString()
          }], {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (insertError) {
          // If upsert fails, try to fetch again (might have been created by another process)
          if (insertError.code === '23505') {
            console.log('Duplicate key detected, fetching existing record...');
            const { data: existingData, error: retryError } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (retryError) throw retryError;
            setProgress(existingData);
          } else {
            throw insertError;
          }
        } else {
          setProgress(newProgress);
        }
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Fortschritts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Real-time subscription for user_progress changes
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for user:', user.id);

    const subscription = supabase
      .channel(`user_progress_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User progress changed:', payload);
          // Refresh data when user_progress changes
          fetchProgress();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to user_progress changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error, retrying...');
          // Retry subscription after a delay
          setTimeout(() => {
            fetchProgress();
          }, 1000);
        }
      });

    return () => {
      console.log('Cleaning up subscription for user:', user.id);
      subscription.unsubscribe();
    };
  }, [user, fetchProgress]);

  const refreshProgress = useCallback(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getLevelInfo = (level: string) => {
    const levelConfig = {
      'Anfänger': {
        icon: '🌱',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Du beginnst deine GFK-Reise'
      },
      'Fortgeschritten': {
        icon: '🌿',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Du entwickelst deine GFK-Fähigkeiten'
      },
      'Profi': {
        icon: '🌳',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'Du beherrschst die GFK-Grundlagen'
      },
      'Experte': {
        icon: '🌟',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        description: 'Du bist ein GFK-Experte'
      },
      'GFK Meister': {
        icon: '👑',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        description: 'Du bist ein GFK-Meister'
      }
    };

    return levelConfig[level as keyof typeof levelConfig] || levelConfig['Anfänger'];
  };

  const getNextLevelInfo = () => {
    if (!progress) return null;

    const levelThresholds = {
      'Anfänger': 20,
      'Fortgeschritten': 50,
      'Profi': 100,
      'Experte': 200,
      'GFK Meister': null
    };

    const currentThreshold = levelThresholds[progress.current_level as keyof typeof levelThresholds];
    
    if (currentThreshold === null) {
      return { remaining: 0, nextLevel: null };
    }

    const remaining = currentThreshold - progress.total_transformations;
    const nextLevel = Object.keys(levelThresholds).find(level => 
      levelThresholds[level as keyof typeof levelThresholds] === currentThreshold
    );

    return { remaining, nextLevel };
  };

  return {
    progress,
    isLoading,
    error,
    getLevelInfo,
    getNextLevelInfo,
    refreshProgress
  };
}; 