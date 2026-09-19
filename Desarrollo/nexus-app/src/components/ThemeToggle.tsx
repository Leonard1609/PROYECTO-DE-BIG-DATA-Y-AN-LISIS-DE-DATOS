import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  const toLight = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg nx-shell-muted hover:nx-shell-text hover:bg-black/5 dark:hover:bg-white/5 transition"
      aria-label={toLight ? 'Pasar a claro' : 'Pasar a oscuro'}
      title={toLight ? 'Claro' : 'Oscuro'}
    >
      {toLight ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
