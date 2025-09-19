'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'zenobank-pay-ui-theme',
  ...props
}: ThemeProviderProps) {
  // ❌ No leer localStorage aquí
  const [theme, _setTheme] = useState<Theme>(defaultTheme);

  // Lee localStorage y aplica el tema SOLO en el cliente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      _setTheme(stored ?? defaultTheme);
    } catch {
      _setTheme(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  // Aplica la clase al <html> y escucha cambios del sistema SOLO en cliente
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      const effective = t === 'system' ? systemTheme : t;
      root.classList.add(effective);
    };

    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };

    applyTheme(theme);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (t: Theme) => {
    try {
      localStorage.setItem(storageKey, t);
    } catch {
      // noop si storage no disponible
    }
    _setTheme(t);
  };

  const value = { theme, setTheme };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
