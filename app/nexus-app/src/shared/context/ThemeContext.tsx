import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const KEY = 'nexus-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

// Tema que se está pintando en pantalla
export type Theme = 'dark' | 'light';
// Preferencia del usuario: "system" sigue el tema del sistema operativo
export type ThemeMode = 'system' | 'light' | 'dark';

function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* ignore */
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_QUERY).matches
  );
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  // Hace que controles nativos (select, scrollbars) también sigan el tema
  document.documentElement.style.colorScheme = theme;
}

interface ThemeContextValue {
  /** Tema resuelto: lo que realmente se ve (dark | light). */
  theme: Theme;
  /** Preferencia elegida: system | light | dark. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Compatibilidad: alterna entre claro y oscuro. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const ThemeProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  const theme: Theme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  // Si cambian el tema del sistema operativo, Nexus lo sigue al instante (modo "Sistema")
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Se aplica antes de pintar para evitar el parpadeo de un tema equivocado
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    const setMode = (next: ThemeMode) => {
      setModeState(next);
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
    };
    return {
      theme,
      mode,
      setMode,
      toggle() {
        setMode(theme === 'dark' ? 'light' : 'dark');
      },
    };
  }, [theme, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Si ya hay un ThemeProvider más arriba (por ejemplo en main.tsx) se reutiliza; así nunca hay dos a la vez
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const parent = useContext(ThemeContext);
  return parent ? <>{children}</> : <ThemeProviderInner>{children}</ThemeProviderInner>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  return ctx;
}
