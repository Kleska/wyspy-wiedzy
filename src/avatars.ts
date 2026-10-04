/**
 * Bohaterowie (awatary) — jedna lista dla wyboru przy zakładaniu osoby, sklepu i panelu rodzica.
 *
 * `emoji` jest kluczem: zapisuje się w `Profile.avatar` i w zakupach (`rewardId` = `avatar:<emoji>`),
 * więc istniejącego znaku nie wolno zmieniać ani usuwać — można tylko dopisywać nowe.
 * Wybieramy znaki, które rysują stare iPady, Android i Windows 10 (emoji do wersji 11, bez nowszych).
 */

export type AvatarGroupId = 'zwierzaki' | 'postacie' | 'pojazdy';

export interface Avatar {
  emoji: string;
  /** Nazwa po polsku — dla czytników ekranu i potwierdzenia zakupu. */
  name: string;
  /** 0 = dostępny od razu; inaczej cena w sklepie. */
  cost: number;
  group: AvatarGroupId;
}

export const AVATAR_GROUPS: { id: AvatarGroupId; title: string }[] = [
  { id: 'zwierzaki', title: 'Zwierzaki' },
  { id: 'postacie', title: 'Postacie' },
  { id: 'pojazdy', title: 'Pojazdy, sport i trofea' },
];

const a = (group: AvatarGroupId, emoji: string, name: string, cost = 0): Avatar => ({ emoji, name, cost, group });

export const AVATARS: Avatar[] = [
  a('zwierzaki', '🦊', 'lis'),
  a('zwierzaki', '🐼', 'panda'),
  a('zwierzaki', '🐸', 'żaba'),
  a('zwierzaki', '🦉', 'sowa'),
  a('zwierzaki', '🐢', 'żółw'),
  a('zwierzaki', '🐙', 'ośmiornica'),
  a('zwierzaki', '🐶', 'pies'),
  a('zwierzaki', '🐱', 'kot'),
  a('zwierzaki', '🐯', 'tygrys', 60),
  a('zwierzaki', '🦁', 'lew', 60),
  a('zwierzaki', '🦈', 'rekin', 80),
  a('zwierzaki', '🦄', 'jednorożec', 80),
  a('zwierzaki', '🦖', 'dinozaur', 100),
  a('zwierzaki', '🐉', 'smok', 150),

  a('postacie', '👨‍🚀', 'astronauta'),
  a('postacie', '👨‍✈️', 'pilot'),
  a('postacie', '🤠', 'kowboj'),
  a('postacie', '👽', 'kosmita'),
  a('postacie', '👻', 'duch'),
  a('postacie', '🧛', 'wampir', 120),
  a('postacie', '🧟', 'zombie', 120),
  a('postacie', '🤖', 'robot', 150),
  a('postacie', '👾', 'stworek z gry', 150),
  a('postacie', '🦸', 'superbohater', 200),
  a('postacie', '🦹', 'superzłoczyńca', 200),
  a('postacie', '🧙', 'czarodziej', 200),

  a('pojazdy', '⚽', 'piłka'),
  a('pojazdy', '🏎️', 'wyścigówka'),
  a('pojazdy', '🎮', 'pad do gier'),
  a('pojazdy', '🚁', 'helikopter', 60),
  a('pojazdy', '🚒', 'wóz strażacki', 60),
  a('pojazdy', '🚂', 'lokomotywa', 80),
  a('pojazdy', '🏍️', 'motocykl', 80),
  a('pojazdy', '⚡', 'piorun', 80),
  a('pojazdy', '🚀', 'rakieta', 100),
  a('pojazdy', '✈️', 'samolot', 100),
  a('pojazdy', '🛸', 'latający spodek', 100),
  a('pojazdy', '🏴‍☠️', 'piracka flaga', 150),
  a('pojazdy', '👑', 'korona', 250),
  a('pojazdy', '🏆', 'puchar', 300),
];

/** Bohaterowie dostępni od razu (zwierzaki na początku — pierwsza osoba dostaje lisa jak dotąd). */
export const FREE_AVATARS: string[] = AVATARS.filter((x) => x.cost === 0).map((x) => x.emoji);

const BY_EMOJI = new Map(AVATARS.map((x) => [x.emoji, x]));

export const avatarName = (emoji: string): string => BY_EMOJI.get(emoji)?.name ?? 'bohater';
