import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('chordAppTheme') as Theme;
    // If a theme is stored, use it. Otherwise, default to 'light'.
    // This ignores the system preference, as requested.
    return storedTheme || 'light';
  });

  useEffect(() => {
    // This effect runs whenever the theme state changes.
    // It applies the correct class to the document root and updates localStorage.
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('chordAppTheme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggleTheme];
};
