/**
 * Bohaterowie (awatary) — jedna lista dla wyboru przy zakładaniu osoby, sklepu i panelu rodzica.
 *
 * `emoji` jest kluczem: zapisuje się w `Profile.avatar` i w zakupach (`rewardId` = `avatar:<emoji>`),
 * więc istniejącego znaku nie wolno zmieniać ani usuwać — można tylko dopisywać nowe.
 * Nowe klucze hero:* wskazują własne portrety SVG. Starsze emoji i zakupy pozostają kompatybilne.
 */

export type AvatarGroupId = 'starter' | 'sport' | 'screen' | 'zwierzaki' | 'postacie' | 'pojazdy' | 'skarby';

export interface Avatar {
  emoji: string;
  /** Nazwa po polsku — dla czytników ekranu i potwierdzenia zakupu. */
  name: string;
  /** 0 = dostępny od razu; inaczej cena w sklepie. */
  cost: number;
  group: AvatarGroupId;
  art?: string;
  description?: string;
}

export const AVATAR_GROUPS: { id: AvatarGroupId; title: string }[] = [
  { id: 'starter', title: 'Na start · bez punktów' },
  { id: 'sport', title: 'Gwiazdy sportu · za punkty' },
  { id: 'screen', title: 'Film i komiks · za punkty' },
  { id: 'zwierzaki', title: 'Zwierzaki' },
  { id: 'postacie', title: 'Postacie' },
  { id: 'pojazdy', title: 'Pojazdy' },
  { id: 'skarby', title: 'Sport i skarby' },
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
  a('zwierzaki', '🐺', 'wilk'),
  a('zwierzaki', '🦅', 'orzeł'),
  a('zwierzaki', '🐯', 'tygrys', 60),
  a('zwierzaki', '🦁', 'lew', 60),
  a('zwierzaki', '🐧', 'pingwin', 60),
  a('zwierzaki', '🦈', 'rekin', 80),
  a('zwierzaki', '🦄', 'jednorożec', 80),
  a('zwierzaki', '🐊', 'krokodyl', 80),
  a('zwierzaki', '🦍', 'goryl', 80),
  a('zwierzaki', '🦖', 'dinozaur', 100),
  a('zwierzaki', '🦇', 'nietoperz', 100),
  a('zwierzaki', '🦂', 'skorpion', 100),
  a('zwierzaki', '🐉', 'smok', 150),

  a('postacie', '👨‍🚀', 'astronauta'),
  a('postacie', '👩‍🚀', 'astronautka'),
  a('postacie', '👨‍✈️', 'pilot'),
  a('postacie', '👩‍✈️', 'pilotka'),
  a('postacie', '👨‍🚒', 'strażak'),
  a('postacie', '🕵️', 'detektyw'),
  a('postacie', '🤠', 'kowboj'),
  a('postacie', '👽', 'kosmita'),
  a('postacie', '👻', 'duch'),
  a('postacie', '🧛', 'wampir', 120),
  a('postacie', '🧟', 'zombie', 120),
  a('postacie', '🧝', 'elf', 120),
  a('postacie', '🧚', 'wróżka', 120),
  a('postacie', '🤖', 'robot', 150),
  a('postacie', '👾', 'stworek z gry', 150),
  a('postacie', '🧞', 'dżin', 150),
  a('postacie', '🤴', 'książę', 150),
  a('postacie', '👸', 'księżniczka', 150),
  a('postacie', '🦸', 'superbohater', 200),
  a('postacie', '🦹', 'superzłoczyńca', 200),
  a('postacie', '🧙', 'czarodziej', 200),

  a('pojazdy', '🏎️', 'wyścigówka'),
  a('pojazdy', '🚲', 'rower'),
  a('pojazdy', '🚁', 'helikopter', 60),
  a('pojazdy', '🚒', 'wóz strażacki', 60),
  a('pojazdy', '🚓', 'radiowóz', 60),
  a('pojazdy', '🚜', 'traktor', 60),
  a('pojazdy', '🚂', 'lokomotywa', 80),
  a('pojazdy', '🏍️', 'motocykl', 80),
  a('pojazdy', '🚀', 'rakieta', 100),
  a('pojazdy', '✈️', 'samolot', 100),
  a('pojazdy', '🛸', 'latający spodek', 100),

  a('skarby', '⚽', 'piłka'),
  a('skarby', '🏀', 'piłka do kosza'),
  a('skarby', '🎮', 'pad do gier'),
  a('skarby', '🛹', 'deskorolka', 80),
  a('skarby', '🎸', 'gitara', 80),
  a('skarby', '⚡', 'piorun', 80),
  a('skarby', '🔥', 'ogień', 100),
  a('skarby', '⚔️', 'miecze', 120),
  a('skarby', '🛡️', 'tarcza', 120),
  a('skarby', '🏴‍☠️', 'piracka flaga', 150),
  a('skarby', '💎', 'diament', 250),
  a('skarby', '👑', 'korona', 250),
  a('skarby', '🏆', 'puchar', 300),
  {"emoji": "hero:street", "name": "Rider", "group": "starter", "cost": 0, "art": "avatars/street.svg", "description": "Miejski styl i nowe wyzwania"},
  {"emoji": "hero:nova", "name": "Nova", "group": "starter", "cost": 0, "art": "avatars/nova.svg", "description": "Kosmos, odkrycia i odwaga"},
  {"emoji": "hero:code", "name": "Pixel", "group": "starter", "cost": 0, "art": "avatars/code.svg", "description": "Technologia i świat gier"},
  {"emoji": "hero:striker", "name": "Napastnik", "group": "starter", "cost": 0, "art": "avatars/striker.svg", "description": "Energia, drużyna i sport"},
  {"emoji": "hero:artist", "name": "Artystka", "group": "starter", "cost": 0, "art": "avatars/artist.svg", "description": "Wyobraźnia, muzyka i własny styl"},
  {"emoji": "hero:detective", "name": "Detektyw", "group": "starter", "cost": 0, "art": "avatars/detective.svg", "description": "Zagadki i sprytne rozwiązania"},
  {"emoji": "hero:ronaldo", "name": "Cristiano Ronaldo", "group": "sport", "cost": 300, "art": "avatars/ronaldo.svg", "description": "Piłkarska kolekcja · numer 7"},
  {"emoji": "hero:messi", "name": "Lionel Messi", "group": "sport", "cost": 300, "art": "avatars/messi.svg", "description": "Piłkarska kolekcja · numer 10"},
  {"emoji": "hero:harry", "name": "Harry Potter", "group": "screen", "cost": 350, "art": "avatars/harry.svg", "description": "Magia · okulary i błyskawica"},
  {"emoji": "hero:hermione", "name": "Hermiona", "group": "screen", "cost": 350, "art": "avatars/hermione.svg", "description": "Magia · wiedza i odwaga"},
  {"emoji": "hero:wednesday", "name": "Wednesday", "group": "screen", "cost": 400, "art": "avatars/wednesday.svg", "description": "Mroczny styl · czarno-biały kołnierzyk"},
  {"emoji": "hero:spider", "name": "Spider-Man", "group": "screen", "cost": 450, "art": "avatars/spider.svg", "description": "Komiksowa kolekcja · pajęcza maska"},
  {"emoji": "hero:batman", "name": "Batman", "group": "screen", "cost": 450, "art": "avatars/batman.svg", "description": "Komiksowa kolekcja · nocny obrońca"},
  {"emoji": "hero:mando", "name": "Mandalorianin", "group": "screen", "cost": 500, "art": "avatars/mando.svg", "description": "Kosmiczna kolekcja · metalowy hełm"},
];

/** Bohaterowie dostępni od razu (zwierzaki na początku — pierwsza osoba dostaje lisa jak dotąd). */
export const FREE_AVATARS: string[] = AVATARS.filter((x) => x.cost === 0).map((x) => x.emoji);

export const STARTER_AVATARS = AVATARS.filter((a) => a.group === 'starter').map((a) => a.emoji);

const BY_EMOJI = new Map(AVATARS.map((x) => [x.emoji, x]));

export const avatarInfo = (id: string) => BY_EMOJI.get(id);
export const avatarName = (emoji: string): string => BY_EMOJI.get(emoji)?.name ?? 'bohater';

/**
 * Bohaterowie, których osoba może wybrać: darmowi i kupieni (zakup = Redemption `avatar:<emoji>`, nieodrzucony).
 * Aktualny bohater zawsze jest na liście — rodzic mógł ustawić w panelu takiego, którego dziecko nie kupiło.
 */
export function ownedAvatars(profileId: string, current: string, redemptions: { profileId: string; rewardId: string; status: string }[]): Set<string> {
  const owned = new Set(FREE_AVATARS);
  for (const r of redemptions) {
    if (r.profileId === profileId && r.status !== 'rejected' && r.rewardId.startsWith('avatar:')) owned.add(r.rewardId.slice(7));
  }
  owned.add(current);
  return owned;
}
