import { supabase } from '../supabaseClient';
import { useState, useCallback } from 'react';

interface ContentRequest {
  type: 'hero' | 'about' | 'features' | 'testimonial' | 'cta' | 'example';
  context?: string;
  tone?: 'professional' | 'friendly' | 'empathetic' | 'inspiring';
  length?: 'short' | 'medium' | 'long';
}

interface GeneratedContent {
  content: string;
  type: string;
  tone: string;
  length: string;
}

export const useContentGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (request: ContentRequest): Promise<GeneratedContent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', {
        body: request
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as GeneratedContent;

    } catch (err) {
      console.error('Error generating content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateHeroText = (tone: 'professional' | 'friendly' | 'empathetic' | 'inspiring' = 'inspiring') => {
    return generateContent({ type: 'hero', tone, length: 'medium' });
  };

  const generateAboutText = (length: 'short' | 'medium' | 'long' = 'medium') => {
    return generateContent({ type: 'about', tone: 'empathetic', length });
  };

  const generateFeaturesList = () => {
    return generateContent({ type: 'features', tone: 'professional', length: 'medium' });
  };

  const generateTestimonial = () => {
    return generateContent({ type: 'testimonial', tone: 'friendly', length: 'medium' });
  };

  const generateCTA = (context?: string) => {
    return generateContent({ type: 'cta', tone: 'inspiring', length: 'short', context });
  };

  const generateExample = () => {
    return generateContent({ type: 'example', tone: 'empathetic', length: 'medium' });
  };

  return {
    generateContent,
    generateHeroText,
    generateAboutText,
    generateFeaturesList,
    generateTestimonial,
    generateCTA,
    generateExample,
    isLoading,
    error
  };
};