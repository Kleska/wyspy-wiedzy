import { avatarInfo, ownedAvatars } from './avatars';
import { nowIso, store, uid } from './data/store';
import { computeProgress } from './engine';

const purchases = new Map<string, Promise<void>>();
/** Ponowne sprawdzenie salda i własności po potwierdzeniu, bez podwójnego pobrania punktów. */
export function unlockAvatar(profileId: string, avatarId: string): Promise<void> {
  const active = purchases.get(profileId);
  if (active) return active;
  const task = (async () => {
    const avatar = avatarInfo(avatarId);
    const profile = store.get('profile', profileId);
    if (!avatar || !profile || profile.deleted) throw new Error('Ten bohater lub profil nie jest dostępny.');
    const redemptions = store.list('redemption');
    const owned = ownedAvatars(profileId, profile.avatar, redemptions);
    if (!owned.has(avatarId)) {
      const progress = computeProgress({ profileId, attempts: store.list('attempt'), sessions: store.list('session'), redemptions, topics: store.allTopics(), settings: store.settingsFor(profileId), since: profile.resetAt, now: Date.now() });
      if (progress.coins < avatar.cost) throw new Error(`Brakuje ${avatar.cost - progress.coins} punktów.`);
      const at = nowIso();
      await store.put('redemption', { id: uid(), profileId, rewardId: `avatar:${avatarId}`, title: `Bohater: ${avatar.name}`, cost: avatar.cost, status: 'approved', real: false, at, decidedAt: at });
    }
    const current = store.get('profile', profileId);
    if (current) await store.put('profile', { ...current, avatar: avatarId, updatedAt: nowIso() });
  })();
  purchases.set(profileId, task);
  void task.finally(() => purchases.delete(profileId)).catch(() => {});
  return task;
}
