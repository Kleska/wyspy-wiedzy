import { describe, expect, it } from 'vitest';
import { AVATAR_GROUPS, AVATARS, avatarName, FREE_AVATARS } from '../src/avatars';

describe('bohaterowie', () => {
  it('każdy znak jest tylko raz, ma nazwę i grupę', () => {
    expect(new Set(AVATARS.map((a) => a.emoji)).size).toBe(AVATARS.length);
    const groups = new Set(AVATAR_GROUPS.map((g) => g.id));
    for (const a of AVATARS) {
      expect(a.name.trim(), a.emoji).not.toBe('');
      expect(groups.has(a.group), a.emoji).toBe(true);
      expect(a.cost, a.emoji).toBeGreaterThanOrEqual(0);
    }
    expect(avatarName('👨‍✈️')).toBe('pilot');
    expect(avatarName('nieznany')).toBe('bohater');
  });

  it('na start są nie tylko zwierzaki, a pierwszy jest lis', () => {
    expect(FREE_AVATARS[0]).toBe('🦊');
    for (const g of AVATAR_GROUPS) {
      expect(AVATARS.some((a) => a.group === g.id && a.cost === 0), g.title).toBe(true);
    }
  });

  it('dotychczasowi bohaterowie zostają (zapisani w profilach i zakupach)', () => {
    const before = ['🦊', '🐼', '🐸', '🦉', '🐢', '🐙', '🐶', '🐱', '🐯', '🦁', '🦈', '🦄', '🦖', '🚀', '✈️', '🐉', '🤖', '👾', '🦸', '🧙'];
    const now = new Map(AVATARS.map((a) => [a.emoji, a.cost]));
    for (const e of before) expect(now.has(e), e).toBe(true);
    // Darmowi nie mogą stać się płatni — ktoś już ich używa.
    for (const e of before.slice(0, 8)) expect(now.get(e), e).toBe(0);
  });
});
