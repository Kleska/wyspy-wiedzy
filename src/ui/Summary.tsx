import { useMemo } from 'react';
import { store } from '../data/store';
import { coinText } from '../themes';
import { useApp, type SessionResult } from './hooks';
import { Icon, Stars } from './icons';

const COLORS = ['#E0512E', '#F2B705', '#2A7F45', '#1F6FA8', '#8A4FD1', '#FF5C8A', '#A6E35A'];

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.left}%`, background: b.color, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}

export function Summary({ result }: { result: SessionResult }) {
  const { theme, go } = useApp();
  const acc = result.firstTotal ? result.firstCorrect / result.firstTotal : 0;
  const topic = result.topicId ? store.topics().find((t) => t.id === result.topicId) : null;
  const title = acc >= 0.9 ? 'Mistrzowsko!' : acc >= 0.7 ? 'Świetna robota!' : acc >= 0.5 ? 'Dobrze idzie!' : 'Trening czyni mistrza!';
  const mins = Math.floor(result.seconds / 60);
  const secs = result.seconds % 60;
  return (
    <div className="summary">
      {acc >= 0.7 && <Confetti />}
      <div className="label">{topic ? topic.title : 'Powtórka'}</div>
      <h1>{title}</h1>
      {topic && (
        <div style={{ color: 'var(--gold)' }}>
          <Stars n={result.starsAfter} size={48} />
          {result.starsAfter > result.starsBefore && (
            <p style={{ fontWeight: 800, color: 'var(--text)', marginTop: 6 }}>Nowa gwiazdka w temacie!</p>
          )}
        </div>
      )}
      <div className="summary-stats">
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>
            {result.firstCorrect}/{result.firstTotal}
          </b>
          <div className="muted" style={{ fontWeight: 700 }}>
            dobrze za pierwszym razem
          </div>
        </div>
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>+{result.xpGained} XP</b>
          <div className="muted" style={{ fontWeight: 700 }}>
            doświadczenia
          </div>
        </div>
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>+{result.coinsGained}</b>
          <div className="muted" style={{ fontWeight: 700 }}>
            {coinText(result.coinsGained, theme).replace(/^\d+ /, '')}
          </div>
        </div>
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>
            {mins}:{String(secs).padStart(2, '0')}
          </b>
          <div className="muted" style={{ fontWeight: 700 }}>
            czasu nauki
          </div>
        </div>
      </div>
      {result.levelAfter > result.levelBefore && (
        <div className="card panel" style={{ fontWeight: 800, fontSize: 20 }}>
          <Icon name="trophy" /> Nowy poziom: {theme.levelLabel(result.levelAfter)}!
        </div>
      )}
      {result.newBadges.length > 0 && (
        <div className="card" style={{ fontWeight: 800 }}>
          <Icon name="award" /> Nowa odznaka: {result.newBadges.join(', ')}
        </div>
      )}
      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        {result.topicId && (
          <button className="btn btn-lg" onClick={() => go({ name: 'practice', topicId: result.topicId, nonce: Date.now() })}>
            <Icon name="repeat" /> Jeszcze raz
          </button>
        )}
        <button className="btn btn-primary btn-lg" onClick={() => go({ name: 'home' })}>
          Wróć na start
        </button>
      </div>
    </div>
  );
}
