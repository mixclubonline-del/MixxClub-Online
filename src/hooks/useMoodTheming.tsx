import { useState, useEffect, useCallback } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
}

export const useMoodTheming = () => {
  const [theme, setTheme] = useState<ThemeColors>({
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))'
  });

  const updateMood = useCallback((mood: 'energetic' | 'calm' | 'dark' | 'bright') => {
    const moodThemes = {
      energetic: {
        primary: '#ef4444',
        secondary: '#f97316'
      },
      calm: {
        primary: '#3b82f6',
        secondary: '#8b5cf6'
      },
      dark: {
        primary: '#6366f1',
        secondary: '#8b5cf6'
      },
      bright: {
        primary: '#f59e0b',
        secondary: '#eab308'
      }
    };

    setTheme(moodThemes[mood] || moodThemes.calm);
  }, []);

  return {
    theme,
    updateMood
  };
};