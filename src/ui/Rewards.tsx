import { useState } from 'react';
import { askConfirm } from './dialogs';
import { nowIso, store, uid } from '../data/store';
import { FREEZE_COST, FREEZE_ID, FREEZE_MAX } from '../engine';
import { coinText, plural } from '../themes';
import { useApp, useProgress } from './hooks';
import { Icon } from './icons';
import { FREE_AVATARS } from './Onboarding';
import { TopBar } from './TopBar';

export const PAID_AVATARS: { emoji: string; cost: number }[] = [
  { emoji: '🐯', cost: 60 },
  { emoji: '🦁', cost: 60 },
  { emoji: '🦈', cost: 80 },
  { emoji: '🦄', cost: 80 },
  { emoji: '🦖', cost: 100 },
  { emoji: '🚀', cost: 100 },
  { emoji: '✈️', cost: 100 },
  { emoji: '🐉', cost: 150 },
  { emoji: '🤖', cost: 150 },
  { emoji: '👾', cost: 150 },
  { emoji: '🦸', cost: 200 },
  { emoji: '🧙', cost: 200 },
];

type Tab = 'shop' | 'badges' | 'requests';

export function Rewards() {
  const { profile, theme, go, toast } = useApp();
  const progress = useProgress(profile.id)!;
  const [tab, setTab] = useState<Tab>('shop');
  const settings = store.settings;
  const mine = store
    .list('redemption')
    .filter((r) => r.profileId === profile.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  const owned = new Set([...FREE_AVATARS, ...mine.filter((r) => r.rewardId.startsWith('avatar:') && r.status !== 'rejected').map((r) => r.rewardId.slice(7))]);

  const requestReal = async (rewardId: string, title: string, cost: number) => {
    if (progress.coins < cost) return;
    if (!(await askConfirm(`Poprosić o „${title}” za ${coinText(cost, theme)}?`, { ok: 'Poproś' }))) return;
    await store.put('redemption', { id: uid(), profileId: profile.id, rewardId, title, cost, status: 'pending', real: true, at: nowIso(), decidedAt: null });
    toast('Prośba wysłana do rodzica!');
  };

  const buyAvatar = async (emoji: string, cost: number) => {
    if (progress.coins < cost) return;
    await store.put('redemption', { id: uid(), profileId: profile.id, rewardId: `avatar:${emoji}`, title: `Bohater ${emoji}`, cost, status: 'approved', real: false, at: nowIso(), decidedAt: nowIso() });
    await store.put('profile', { ...profile, avatar: emoji, updatedAt: nowIso() });
    toast('Nowy bohater odblokowany!');
  };

  const setAvatar = (emoji: string) => void store.put('profile', { ...profile, avatar: emoji, updatedAt: nowIso() });

  const buyFreeze = async () => {
    if (progress.coins < FREEZE_COST || progress.freezes >= FREEZE_MAX) return;
    if (!(await askConfirm(`Kupić zamrożenie serii za ${coinText(FREEZE_COST, theme)}?`, { ok: 'Kupuję' }))) return;
    await store.put('redemption', { id: uid(), profileId: profile.id, rewardId: FREEZE_ID, title: 'Zamrożenie serii', cost: FREEZE_COST, status: 'approved', real: false, at: nowIso(), decidedAt: nowIso() });
    toast('Zamrożenie gotowe! Uratuje serię, gdy opuścisz dzień.');
  };

  return (
    <>
      <TopBar back={() => go({ name: 'home' })} />
      <div className="page">
        <div className="page-head">
          <h1>Nagrody</h1>
          <span className="chip">
            <Icon name="coin" size={18} className="ic-coin" />
            Masz {coinText(progress.coins, theme)}
          </span>
        </div>
        <div className="tabs" role="tablist">
          {(
            [
              ['shop', 'Sklep'],
              ['badges', 'Odznaki'],
              ['requests', 'Moje prośby'],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button key={id} role="tab" className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'shop' && (
          <>
            <section className="card freeze-card">
              <span className="freeze-icon" aria-hidden="true">
                <Icon name="snowflake" size={40} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 20 }}>Zamrożenie serii</b>
                <p className="muted" style={{ fontWeight: 700, fontSize: 15 }}>
                  Gdy jednego dnia nie poćwiczysz, zamrożenie uratuje Twoją serię ({progress.streak} {plural(progress.streak, ['dzień', 'dni', 'dni'])}). Możesz mieć najwyżej {FREEZE_MAX}.
                </p>
                <div className="freeze-slots" aria-label={`Masz ${progress.freezes} z ${FREEZE_MAX}`}>
                  {Array.from({ length: FREEZE_MAX }, (_, i) => (
                    <span key={i} className={i < progress.freezes ? 'on' : ''}>
                      <Icon name="snowflake" size={18} />
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" disabled={progress.coins < FREEZE_COST || progress.freezes >= FREEZE_MAX} onClick={buyFreeze}>
                {progress.freezes >= FREEZE_MAX ? 'Masz komplet' : progress.coins < FREEZE_COST ? `Brakuje ${FREEZE_COST - progress.coins}` : `Kup za ${FREEZE_COST}`}
              </button>
            </section>
            <h2 style={{ fontSize: 22 }}>Prawdziwe nagrody</h2>
            {settings.rewards.length === 0 ? (
              <p className="muted" style={{ fontWeight: 700 }}>
                Rodzic może dodać nagrody w panelu rodzica.
              </p>
            ) : (
              <div className="grid-cards">
                {settings.rewards.map((r) => {
                  const missing = r.cost - progress.coins;
                  return (
                    <div key={r.id} className="card shop-item">
                      <Icon name="gift" size={44} style={{ color: 'var(--accent)' }} />
                      <b style={{ fontSize: 18 }}>{r.title}</b>
                      <span className="muted" style={{ fontWeight: 800 }}>
                        {coinText(r.cost, theme)}
                      </span>
                      <button className="btn btn-primary btn-block" disabled={missing > 0} onClick={() => requestReal(r.id, r.title, r.cost)}>
                        {missing > 0 ? `Brakuje ${missing}` : 'Poproś'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <h2 style={{ fontSize: 22, marginTop: 8 }}>Bohaterowie</h2>
            <div className="grid-cards">
              {[...FREE_AVATARS.map((e) => ({ emoji: e, cost: 0 })), ...PAID_AVATARS].map(({ emoji, cost }) => {
                const has = owned.has(emoji);
                return (
                  <div key={emoji} className="card shop-item">
                    <span className="shop-emoji" aria-hidden="true">
                      {emoji}
                    </span>
                    {profile.avatar === emoji ? (
                      <span className="pill good">Twój bohater</span>
                    ) : has ? (
                      <button className="btn btn-sm btn-block" onClick={() => setAvatar(emoji)}>
                        Wybierz
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-primary btn-block" disabled={progress.coins < cost} onClick={() => buyAvatar(emoji, cost)}>
                        Kup za {cost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'badges' && (
          <div className="grid-cards">
            {progress.badges.map((b) => (
              <div key={b.id} className={`card badge ${b.earned ? 'earned' : ''}`}>
                <span className="badge-icon">
                  <Icon name={b.earned ? 'award' : 'lock'} size={34} />
                </span>
                <b>{b.title}</b>
                <span className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
                  {b.description}
                </span>
                {!b.earned && (
                  <div className="bar" style={{ width: '100%', height: 8 }}>
                    <span style={{ width: `${Math.round(b.progress * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div className="col">
            {mine.filter((r) => r.real).length === 0 && (
              <p className="muted" style={{ fontWeight: 700 }}>
                Nie masz jeszcze próśb o nagrody.
              </p>
            )}
            {mine
              .filter((r) => r.real)
              .map((r) => (
                <div key={r.id} className="card row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <b>{r.title}</b>
                    <div className="muted" style={{ fontSize: 14 }}>
                      {new Date(r.at).toLocaleDateString('pl-PL')} · {r.cost} {plural(r.cost, theme.coin)}
                    </div>
                  </div>
                  <span className={`pill ${r.status === 'approved' ? 'good' : r.status === 'rejected' ? 'bad' : ''}`}>
                    {r.status === 'approved' ? 'Zatwierdzona' : r.status === 'rejected' ? 'Odrzucona (punkty wróciły)' : 'Czeka na rodzica'}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
