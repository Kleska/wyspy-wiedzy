import { useEffect } from 'react';
import { loadThemeFonts, THEMES } from '../themes';
import type { ThemeId } from '../types';
import { Icon } from './icons';

/*
 * Miniatura ekranu w danym motywie: wspólny układ listy tematów
 * i karta tematu. Zmienne CSS motywu działają lokalnie dzięki data-theme na kontenerze.
 */
export function ThemePreview({ id }: { id: ThemeId }) {
  const t = THEMES[id];
  useEffect(() => {
    void loadThemeFonts(id);
  }, [id]);

  const board = (
    <span className="tp-list">
      {[1, 2, 3].map((n) => (
        <span key={n} className="tp-row">
          <span className="tp-txt" />
          <span className="tp-bar">
            <span style={{ width: n === 1 ? '80%' : '30%' }} />
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <span className="tp" data-theme={id} aria-hidden="true">
      <span className="tp-top">
        <span className="tp-brand">{t.appName}</span>
        <span className="tp-chip">
          <Icon name="clock" size={10} /> 5 min
        </span>
      </span>
      <span className="tp-main">
        <span className="tp-board">{board}</span>
        <span className="tp-card">
          <span className="tp-label">TEMAT</span>
          <span className="tp-h">Rzeczownik</span>
          <span className="tp-opt">Poznaj temat</span>
          <span className="tp-btn">{t.start}</span>
        </span>
      </span>
    </span>
  );
}
