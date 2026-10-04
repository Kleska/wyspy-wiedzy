import { describe, expect, it } from 'vitest';
import { AVATAR_GROUPS, AVATARS, avatarName, FREE_AVATARS, ownedAvatars } from '../src/avatars';
import { THEME_ORDER, themeOf, THEMES } from '../src/themes';

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
    const free = ['🦊', '🐼', '🐸', '🦉', '🐢', '🐙', '🐶', '🐱', '👨‍🚀', '👨‍✈️', '🤠', '👽', '👻', '⚽', '🏎️', '🎮'];
    const paid = ['🐯', '🦁', '🦈', '🦄', '🦖', '🚀', '✈️', '🐉', '🤖', '👾', '🦸', '🧙', '🧛', '🧟', '🦹', '🚁', '🚒', '🚂', '🏍️', '⚡', '🛸', '🏴‍☠️', '👑', '🏆'];
    const now = new Map(AVATARS.map((a) => [a.emoji, a.cost]));
    for (const e of [...free, ...paid]) expect(now.has(e), e).toBe(true);
    // Darmowi nie mogą stać się płatni — ktoś już ich używa.
    for (const e of free) expect(now.get(e), e).toBe(0);
    // Pierwsza ósemka w tej samej kolejności: od niej zależy, kogo dostaje nowa osoba.
    expect(FREE_AVATARS.slice(0, 8)).toEqual(free.slice(0, 8));
  });

  it('do wyboru są darmowi, kupieni i aktualny bohater', () => {
    const reds = [
      { profileId: 'p1', rewardId: 'avatar:🐉', status: 'approved' },
      { profileId: 'p1', rewardId: 'avatar:🤖', status: 'rejected' },
      { profileId: 'p2', rewardId: 'avatar:🦈', status: 'approved' },
      { profileId: 'p1', rewardId: 'freeze', status: 'approved' },
    ];
    const owned = ownedAvatars('p1', '👑', reds);
    for (const e of FREE_AVATARS) expect(owned.has(e), e).toBe(true);
    expect(owned.has('🐉')).toBe(true);
    expect(owned.has('🤖')).toBe(false); // odrzucony zakup
    expect(owned.has('🦈')).toBe(false); // kupiła inna osoba
    expect(owned.has('👑')).toBe(true); // ustawiony przez rodzica w panelu
    expect(owned.size).toBe(FREE_AVATARS.length + 2);
  });
});

describe('motywy', () => {
  it('każdy motyw z listy ma komplet: nazwy, walutę w trzech formach, pochwały, ikonę i tytuł przedmiotu', () => {
    expect(THEME_ORDER.length).toBe(Object.keys(THEMES).length);
    for (const id of THEME_ORDER) {
      const t = THEMES[id];
      expect(t.id).toBe(id);
      for (const v of [t.name, t.appName, t.tagline, t.topicWord, t.start, t.hello, t.oops, t.icon, ...t.coin, ...t.praise]) expect(v.trim(), id).not.toBe('');
      expect(t.coin.length).toBe(3);
      expect(t.praise.length).toBeGreaterThanOrEqual(3);
      expect(t.subjectTitle({ name: 'Matematyka', island: 'Wyspa Matematyki' }).toLowerCase()).toContain('matematyk');
      expect(t.levelLabel(3)).toContain('3');
    }
  });

  it('nieznany motyw (np. z nowszej wersji na innym urządzeniu) daje domyślny zamiast błędu', () => {
    expect(themeOf('kosmos').id).toBe('kosmos');
    expect(themeOf('nie-ma-takiego').id).toBe('wyspy');
    expect(themeOf(undefined).id).toBe('wyspy');
  });
});
