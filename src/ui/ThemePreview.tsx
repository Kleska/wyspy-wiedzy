import { useEffect } from 'react';
import { loadThemeFonts, THEMES } from '../themes';
import type { ThemeId } from '../types';
import { Icon } from './icons';

/*
 * Miniatura ekranu w danym motywie: pasek z serią i punktami, plansza (mapa / trasa / etapy / lista)
 * i karta tematu. Zmienne CSS motywu działają lokalnie dzięki data-theme na kontenerze.
 */
export function ThemePreview({ id }: { id: ThemeId }) {
  const t = THEMES[id];
  useEffect(() => {
    void loadThemeFonts(id);
  }, [id]);

  const board = (() => {
    switch (t.layout) {
      case 'map':
        return (
          <span className="tp-island">
            <span className="tp-node next" style={{ left: '50%', top: '14%' }}>
              <Icon name="star" size={12} fill="currentColor" stroke={1} />
            </span>
            <span className="tp-node done" style={{ left: '68%', top: '44%' }}>
              <Icon name="check" size={11} stroke={4} />
            </span>
            <span className="tp-node" style={{ left: '36%', top: '72%' }}>
              3
            </span>
          </span>
        );
      case 'route':
        return (
          <span className="tp-route">
            <span className="tp-dot done">
              <Icon name="check" size={10} stroke={4} />
            </span>
            <span className="tp-line" />
            <span className="tp-dot next">
              <Icon name="plane" size={12} />
            </span>
            <span className="tp-line" />
            <span className="tp-dot">3</span>
          </span>
        );
      case 'grid':
        return (
          <span className="tp-grid">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`tp-tile ${n === 2 ? 'next' : ''}`}>
                ETAP {n}
              </span>
            ))}
          </span>
        );
      case 'list':
        return (
          <span className="tp-list">
            {[0.8, 0.45, 0.15].map((w, i) => (
              <span key={i} className="tp-row">
                <span className="tp-txt" />
                <span className="tp-bar">
                  <span style={{ width: `${w * 100}%` }} />
                </span>
              </span>
            ))}
          </span>
        );
    }
  })();

  return (
    <span className="tp" data-theme={id} aria-hidden="true">
      <span className="tp-top">
        <span className="tp-brand">{t.appName}</span>
        <span className="tp-chip">
          <Icon name="flame" size={10} /> 5
        </span>
        <span className="tp-chip">
          <Icon name="coin" size={10} /> 120
        </span>
      </span>
      <span className="tp-main">
        <span className="tp-board">{board}</span>
        <span className="tp-card">
          <span className="tp-label">{t.topicWord}</span>
          <span className="tp-h">Rzeczownik</span>
          <span className="tp-opt">kot</span>
          <span className="tp-btn">{t.start}</span>
        </span>
      </span>
    </span>
  );
}
