// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../src/data/store';
import { seedPreview } from '../src/preview';
import { assignQuizToProfiles } from '../src/quizAssignment';
import { snapshot } from '../src/ui/Practice';
import { unlockAvatar } from '../src/avatarPurchase';
import { AVATARS, ownedAvatars, STARTER_AVATARS } from '../src/avatars';
import { readFileSync } from 'node:fs';
beforeEach(async () => { window.WW_CONFIG = {}; await store.init(); await store.resetLocal(); await seedPreview(); });
describe('wspólna kartkówka', () => {
  it('przypisuje identyczne pytania i osobne identyfikatory, zachowuje wcześniejsze kartkówki', async () => {
    const topic = store.topicsFor('demo-badaczka').find((t) => t.exercises.length >= 5)!;
    const before = store.get('profile', 'demo-badaczka')!.quizzes!.length;
    const result = await assignQuizToProfiles({ profileIds: ['demo-badaczka', 'demo-kolezanka', 'demo-kolezanka'], topicIds: [topic.id], count: 5, title: 'Wspólna' });
    expect(result.quizzes).toHaveLength(2);
    expect(result.quizzes[0].items).toEqual(result.quizzes[1].items);
    expect(result.quizzes[0].id).not.toBe(result.quizzes[1].id);
    expect(result.quizzes[0].batchId).toBe(result.quizzes[1].batchId);
    expect(store.get('profile', 'demo-badaczka')!.quizzes).toHaveLength(before + 1);
    expect(store.list('session').some((s) => s.quizId === result.quizzes[1].id)).toBe(false);
  });
  it('odrzuca różne klasy przed jakimkolwiek zapisem', async () => {
    const put = vi.spyOn(store, 'putMany');
    await expect(assignQuizToProfiles({ profileIds: ['demo-odkrywca', 'demo-badaczka'], topicIds: ['t'], count: 5 })).rejects.toThrow('tej samej klasy');
    expect(put).not.toHaveBeenCalled(); put.mockRestore();
  });
  it('odrzuca brak odbiorców, brakujący profil i niedostępne tematy', async () => {
    await expect(assignQuizToProfiles({ profileIds: [], topicIds: ['t'], count: 5 })).rejects.toThrow('dziecko');
    await expect(assignQuizToProfiles({ profileIds: ['unknown'], topicIds: ['t'], count: 5 })).rejects.toThrow('profil');
    await expect(assignQuizToProfiles({ profileIds: ['demo-badaczka'], topicIds: ['removed'], count: 5 })).rejects.toThrow('tematy');
  });
});
describe('nowa kolekcja bohaterów', () => {
  it('podstawowe portrety są darmowe, sport i kino wymagają punktów, grafiki istnieją', () => {
    expect(STARTER_AVATARS).toHaveLength(6);
    for (const a of AVATARS.filter((a) => !!a.art)) {
      if (a.art!.startsWith('https://')) {
        expect(new URL(a.art!).protocol).toBe('https:');
        expect(a.credit?.source).toMatch(/^https:\/\//);
        expect(a.credit?.kind).not.toBe('Fotografia cosplay');
        continue;
      }
      const data = readFileSync(`public/${a.art}`);
      expect(data.subarray(0, 4).toString()).toBe('RIFF');
      expect(data.subarray(8, 12).toString()).toBe('WEBP');
      expect(readFileSync(`public/${a.thumbnail}`).length).toBeGreaterThan(100);
      if (a.group === 'starter') expect(a.cost).toBe(0);
      if (a.group !== 'starter') expect(a.cost).toBeGreaterThan(0);
    }
    expect(ownedAvatars('demo-odkrywca', 'hero:street', []).has('hero:ronaldo')).toBe(false);
  });
  it('wybór darmowego portretu nie wydaje punktów ani nie kasuje planu', async () => {
    const before = store.list('redemption').length;
    const plan = store.get('profile', 'demo-odkrywca')!.plan;
    await unlockAvatar('demo-odkrywca', 'hero:code');
    expect(store.get('profile', 'demo-odkrywca')!.avatar).toBe('hero:code');
    expect(store.get('profile', 'demo-odkrywca')!.plan).toEqual(plan);
    expect(store.list('redemption')).toHaveLength(before);
  });
  it('brak punktów nie odblokowuje premium ani nie zapisuje zakupu', async () => {
    await expect(unlockAvatar('demo-kolezanka', 'hero:ronaldo')).rejects.toThrow('Brakuje');
    expect(store.list('redemption')).toHaveLength(0);
  });
  it('zakup premium pobiera punkty raz także przy równoczesnym kliknięciu', async () => {
    const profileId = 'demo-kolezanka';
    const topic = store.topicsFor(profileId).find((t) => t.exercises.length)!;
    const at = new Date().toISOString();
    await store.putMany('attempt', Array.from({ length: 400 }, (_, i) => ({ id: `earned-${i}`, profileId, sessionId: 'earned', topicId: topic.id, exerciseId: topic.exercises[i % topic.exercises.length].id, at, correct: true, retry: false, hint: false, ms: 1000 })));
    const before = snapshot(profileId).coins;
    await Promise.all([unlockAvatar(profileId, 'hero:ronaldo'), unlockAvatar(profileId, 'hero:ronaldo')]);
    expect(store.list('redemption')).toHaveLength(1);
    expect(snapshot(profileId).coins).toBe(before - 300);
    expect(store.get('profile', profileId)!.avatar).toBe('hero:ronaldo');
  });
  it('ponowne wybranie kupionego bohatera nie pobiera punktów', async () => {
    const at = new Date().toISOString();
    await store.put('redemption', { id: 'already', profileId: 'demo-kolezanka', rewardId: 'avatar:hero:ronaldo', title: 'Bohater', cost: 300, status: 'approved', real: false, at, decidedAt: at });
    await Promise.all([unlockAvatar('demo-kolezanka', 'hero:ronaldo'), unlockAvatar('demo-kolezanka', 'hero:ronaldo')]);
    expect(store.list('redemption')).toHaveLength(1);
    expect(store.get('profile', 'demo-kolezanka')!.avatar).toBe('hero:ronaldo');
  });
});
