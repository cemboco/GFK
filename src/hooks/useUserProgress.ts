import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
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
          // Create initial progress record
          const { data: newProgress, error: insertError } = await supabase
            .from('user_progress')
            .insert([{
              user_id: user.id,
              total_transformations: 0,
              current_level: 'Anfänger',
              level_progress: 0
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          setProgress(newProgress);
        }
      } catch (err) {
        console.error('Error fetching user progress:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden des Fortschritts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

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
    getNextLevelInfo
  };
}; 