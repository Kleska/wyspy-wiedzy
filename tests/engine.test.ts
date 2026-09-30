import { describe, expect, it } from 'vitest';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { DEFAULT_SETTINGS } from '../src/data/store';
import { parseDsl } from '../src/dsl';
import { buildReviewQueue, buildTopicQueue, computeProgress, itemKey, levelFromXp, suggestTopic } from '../src/engine';
import type { Attempt, ParsedTopic, Session } from '../src/types';

const topics: ParsedTopic[] = BUILTIN_TOPICS.map((t) => ({ ...t, ...parseDsl(t.dsl), builtin: true }));
const noun = topics.find((t) => t.id === 'b-rzeczownik')!;
const P = 'kid';
let n = 0;

function att(topic: ParsedTopic, i: number, correct: boolean, at: string, sessionId = 's1', retry = false): Attempt {
  return { id: `a${n++}`, profileId: P, sessionId, topicId: topic.id, exerciseId: topic.exercises[i].id, correct, retry, hint: false, ms: 3000, at };
}

function sess(id: string, startedAt: string, completed = true, activeSeconds = 300): Session {
  return { id, profileId: P, topicId: noun.id, mode: 'topic', startedAt, endedAt: startedAt, activeSeconds, answered: 10, correct: 9, completed };
}

function progress(attempts: Attempt[], sessions: Session[], now: string) {
  return computeProgress({ profileId: P, attempts, sessions, redemptions: [], topics, settings: DEFAULT_SETTINGS, now: Date.parse(now) });
}

describe('postęp', () => {
  it('pusty profil', () => {
    const p = progress([], [], '2026-10-01T10:00:00');
    expect(p.xp).toBe(0);
    expect(p.level).toBe(1);
    expect(p.coins).toBe(0);
    expect(p.streak).toBe(0);
    expect(p.topics.get(noun.id)?.newCount).toBe(noun.exercises.length);
  });

  it('XP, monety, seria i pudełka powtórek', () => {
    const a = [
      att(noun, 0, true, '2026-10-01T10:00:00'),
      att(noun, 1, true, '2026-10-01T10:00:10'),
      att(noun, 2, true, '2026-10-01T10:00:20'),
      att(noun, 3, false, '2026-10-01T10:00:30'),
      att(noun, 3, true, '2026-10-01T10:00:40', 's1', true),
    ];
    const p = progress(a, [sess('s1', '2026-10-01T10:00:00')], '2026-10-01T12:00:00');
    // 3×10 + combo(3.) 2 + błąd 1 + poprawka 5
    expect(p.xp).toBe(38);
    // 3 monety za odpowiedzi + 5 za ukończoną sesję (wynik 3/4 < 80%)
    expect(p.coins).toBe(8);
    expect(p.streak).toBe(1);
    const st = p.items.get(itemKey(noun.id, noun.exercises[0].id))!;
    expect(st.box).toBe(1);
    // Poprawka w tej samej sesji nie podnosi pudełka
    expect(p.items.get(itemKey(noun.id, noun.exercises[3].id))!.box).toBe(0);
  });

  it('pudełko rośnie tylko, gdy zadanie było do powtórki', () => {
    const a = [att(noun, 0, true, '2026-10-01T10:00:00', 's1'), att(noun, 0, true, '2026-10-01T11:00:00', 's2'), att(noun, 0, true, '2026-10-02T09:00:00', 's3')];
    const p = progress(a, [], '2026-10-02T12:00:00');
    expect(p.items.get(itemKey(noun.id, noun.exercises[0].id))!.box).toBe(2);
  });

  it('seria dni liczy się wstecz od wczoraj, jeśli dziś jeszcze nie było nauki', () => {
    const s = [sess('a', '2026-09-28T10:00:00'), sess('b', '2026-09-29T10:00:00'), sess('c', '2026-09-30T10:00:00')];
    expect(progress([], s, '2026-10-01T08:00:00').streak).toBe(3);
    expect(progress([], s, '2026-10-02T08:00:00').streak).toBe(0);
    expect(progress([], s, '2026-10-02T08:00:00').bestStreak).toBe(3);
  });

  it('wydane monety i odrzucone prośby', () => {
    const a = Array.from({ length: 10 }, (_, i) => att(noun, i, true, `2026-10-01T10:00:${10 + i}`));
    const base = { profileId: P, attempts: a, sessions: [sess('s1', '2026-10-01T10:00:00')], topics, settings: DEFAULT_SETTINGS, now: Date.parse('2026-10-01T12:00:00') };
    const earned = computeProgress({ ...base, redemptions: [] }).coins;
    const p = computeProgress({
      ...base,
      redemptions: [
        { id: 'r1', profileId: P, rewardId: 'x', title: 'x', cost: 5, status: 'pending', real: true, at: '2026-10-01T12:00:00' },
        { id: 'r2', profileId: P, rewardId: 'y', title: 'y', cost: 7, status: 'rejected', real: true, at: '2026-10-01T12:00:00' },
      ],
    });
    expect(p.coins).toBe(earned - 5);
    expect(p.pendingRewards).toBe(1);
  });

  it('poziomy', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
  });
});

describe('układanie sesji', () => {
  it('nowy temat: tyle zadań, ile ustawiono, bez powtórzeń', () => {
    const p = progress([], [], '2026-10-01T10:00:00');
    const q = buildTopicQueue(noun, p, 10, Date.parse('2026-10-01T10:00:00'));
    expect(q).toHaveLength(10);
    expect(new Set(q.map((x) => x.ex.id)).size).toBe(10);
  });

  it('najpierw zadania z błędami, potem nowe', () => {
    const a = [att(noun, 5, false, '2026-10-01T10:00:00')];
    const p = progress(a, [], '2026-10-01T10:05:00');
    const q = buildTopicQueue(noun, p, 3, Date.parse('2026-10-01T10:05:00'));
    expect(q.map((x) => x.ex.id)).toContain(noun.exercises[5].id);
  });

  it('powtórka zbiera zaległe zadania z różnych tematów', () => {
    const verb = topics.find((t) => t.id === 'b-czasownik')!;
    const a = [att(noun, 0, false, '2026-10-01T10:00:00'), att(verb, 0, true, '2026-09-20T10:00:00')];
    const p = progress(a, [], '2026-10-01T12:00:00');
    const q = buildReviewQueue(topics, p, 10, Date.parse('2026-10-01T12:00:00'));
    expect(q.map((x) => x.topicId).sort()).toEqual(['b-czasownik', 'b-rzeczownik']);
  });

  it('polecany temat: najpierw pierwszy nowy', () => {
    const p = progress([], [], '2026-10-01T10:00:00');
    expect(suggestTopic(topics, p)?.id).toBe('b-rzeczownik');
  });
});
