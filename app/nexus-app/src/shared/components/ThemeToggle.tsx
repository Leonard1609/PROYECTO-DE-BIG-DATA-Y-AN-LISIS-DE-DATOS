import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../context/ThemeContext';

const OPTIONS: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
];

/**
 * Selector de apariencia: un botón que despliega un menú con Sistema / Claro / Oscuro.
 * Se mantiene el nombre ThemeToggle para no tocar los lugares donde ya se usa.
 */
export const ThemeToggle: React.FC = () => {
  const { theme, mode, setMode } = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = OPTIONS.find((o) => o.value === mode) ?? OPTIONS[0];
  const CurrentIcon = current.icon;

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // Al abrir, el foco va a la opción elegida (navegación con teclado)
  useEffect(() => {
    if (!open) return;
    const index = OPTIONS.findIndex((o) => o.value === mode);
    itemRefs.current[index]?.focus();
  }, [open, mode]);

  const choose = (value: ThemeMode) => {
    setMode(value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => el !== null);
    const index = items.findIndex((el) => el === document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="nx-theme relative no-print">
      <button
        ref={buttonRef}
        type="button"
        className="nx-theme-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Apariencia: ${current.label}`}
        title="Apariencia"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <CurrentIcon size={16} />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={14} className={`nx-theme-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="nx-theme-menu" role="menu" aria-label="Apariencia" onKeyDown={onMenuKeyDown}>
          <p className="nx-theme-title">Apariencia</p>
          {OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            const selected = opt.value === mode;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className="nx-theme-item"
                onClick={() => choose(opt.value)}
              >
                <Icon size={16} className="nx-theme-item-icon" />
                <span className="flex-1">{opt.label}</span>
                {opt.value === 'system' && (
                  <span className="nx-theme-hint">{theme === 'dark' ? 'oscuro' : 'claro'}</span>
                )}
                {selected && <Check size={15} className="nx-theme-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
