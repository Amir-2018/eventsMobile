import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useRNColorScheme } from 'react-native';

type Theme = 'light' | 'dark';
type Language = 'fr' | 'en';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme') as Theme | null;
      const savedLang = await AsyncStorage.getItem('language') as Language | null;
      
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme(systemColorScheme ?? 'light');
      }
      
      if (savedLang) {
        setLanguageState(savedLang);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

