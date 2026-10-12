/**
 * Bohaterowie (awatary) — jedna lista dla wyboru przy zakładaniu osoby, sklepu i panelu rodzica.
 *
 * `emoji` jest kluczem: zapisuje się w `Profile.avatar` i w zakupach (`rewardId` = `avatar:<emoji>`),
 * więc istniejącego znaku nie wolno zmieniać ani usuwać — można tylko dopisywać nowe.
 * Nowe klucze hero:* wskazują ilustracje i fotografie, wraz z lekkimi miniaturami. Starsze emoji i zakupy pozostają kompatybilne.
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
  thumbnail?: string;
  position?: string;
  thumbnailPosition?: string;
  /** Źródło i informacje o prawach do grafiki. */
  credit?: { kind?: string; author: string; source: string; license: string; licenseUrl: string; changes: string };
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
  {"emoji": "hero:street", "name": "Rider", "group": "starter", "cost": 0, "art": "avatars/street-v4.webp", "thumbnail": "avatars/street-icon-v4.webp", "description": "Miejski styl i nowe wyzwania", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:nova", "name": "Nova", "group": "starter", "cost": 0, "art": "avatars/nova-v4.webp", "thumbnail": "avatars/nova-icon-v4.webp", "description": "Kosmos, odkrycia i odwaga", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:code", "name": "Pixel", "group": "starter", "cost": 0, "art": "avatars/code-v4.webp", "thumbnail": "avatars/code-icon-v4.webp", "description": "Technologia i świat gier", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:striker", "name": "Napastnik", "group": "starter", "cost": 0, "art": "avatars/striker-v4.webp", "thumbnail": "avatars/striker-icon-v4.webp", "description": "Energia, drużyna i sport", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:artist", "name": "Artystka", "group": "starter", "cost": 0, "art": "avatars/artist-v4.webp", "thumbnail": "avatars/artist-icon-v4.webp", "description": "Wyobraźnia, muzyka i własny styl", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:detective", "name": "Detektyw", "group": "starter", "cost": 0, "art": "avatars/detective-v4.webp", "thumbnail": "avatars/detective-icon-v4.webp", "description": "Zagadki i sprytne rozwiązania", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:ronaldo", "name": "Cristiano Ronaldo", "group": "sport", "cost": 300, "art": "avatars/ronaldo-v4.webp", "thumbnail": "avatars/ronaldo-icon-v4.webp", "description": "Piłkarska kolekcja · numer 7", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:messi", "name": "Lionel Messi", "group": "sport", "cost": 300, "credit": {"author": "Hossein Zohrevand / Tasnim News Agency", "source": "https://commons.wikimedia.org/wiki/File:Lionel_Messi_WC2022.jpg", "license": "CC BY 4.0", "licenseUrl": "https://creativecommons.org/licenses/by/4.0/", "changes": "Kadrowanie, zmniejszenie i konwersja do WebP."}, "art": "avatars/messi-v2.webp", "thumbnail": "avatars/messi-icon-v2.webp", "description": "Piłkarska kolekcja · numer 10"},
  {"emoji": "hero:harry", "name": "Harry Potter", "group": "screen", "cost": 350, "art": "avatars/harry-v4.webp", "thumbnail": "avatars/harry-icon-v4.webp", "description": "Magia · okulary i błyskawica", "position": "50% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:hermione", "name": "Hermiona", "group": "screen", "cost": 350, "art": "avatars/hermione-v3.webp", "thumbnail": "avatars/hermione-icon-v3.webp", "description": "Magia · wiedza i odwaga"},
  {"emoji": "hero:wednesday", "name": "Wednesday", "group": "screen", "cost": 400, "art": "avatars/wednesday-v3.webp", "thumbnail": "avatars/wednesday-icon-v3.webp", "description": "Mroczny styl · czarno-biały kołnierzyk"},
  {"emoji": "hero:spider", "name": "Spider-Man", "group": "screen", "cost": 450, "art": "https://lumiere-a.akamaihd.net/v1/images/eb_comic_12473_12497_12452_12480_12540_12510_12531_816eeaca.jpeg?region=0%2C0%2C2048%2C878", "thumbnail": "https://lumiere-a.akamaihd.net/v1/images/eb_comic_12473_12497_12452_12480_12540_12510_12531_816eeaca.jpeg?region=1260%2C0%2C760%2C878&width=128", "description": "Komiksowa kolekcja · pajęcza maska", "credit": {"kind": "Wizerunek postaci", "author": "Marvel / Disney", "source": "https://marvel.disney.co.jp/character/spiderman", "license": "© Marvel / Disney", "licenseUrl": "https://marvel.disney.co.jp/character/spiderman", "changes": "Materiał opublikowany przez wydawcę. Kadr dopasowany do portretu. Wszelkie prawa do postaci i materiału pozostają przy właścicielach."}, "position": "86% 50%", "thumbnailPosition": "50% 35%"},
  {"emoji": "hero:batman", "name": "Batman", "group": "screen", "cost": 450, "art": "https://static.dc.com/dc/files/default_images/Char_Thumb_Batman_20190116_5c3fc4b40fae42.85141247.jpg", "thumbnail": "https://static.dc.com/dc/files/default_images/Char_Thumb_Batman_20190116_5c3fc4b40fae42.85141247.jpg?w=160", "description": "Komiksowa kolekcja · nocny obrońca", "credit": {"kind": "Wizerunek postaci", "author": "DC", "source": "https://www.dc.com/characters/batman", "license": "© DC", "licenseUrl": "https://www.dc.com/characters/batman", "changes": "Materiał opublikowany przez wydawcę. Kadr dopasowany do portretu. Wszelkie prawa do postaci i materiału pozostają przy właścicielach."}, "position": "50% 15%", "thumbnailPosition": "50% 20%"},
  {"emoji": "hero:mando", "name": "Mandalorianin", "group": "screen", "cost": 500, "art": "https://lumiere-a.akamaihd.net/v1/images/din-djarin-the-mandalorian-main_66f8a62f.jpeg?region=98%2C0%2C1821%2C1023", "thumbnail": "https://lumiere-a.akamaihd.net/v1/images/din-djarin-the-mandalorian-main_66f8a62f.jpeg?region=800%2C0%2C600%2C700&width=128", "description": "Kosmiczna kolekcja · metalowy hełm", "credit": {"kind": "Wizerunek postaci", "author": "Lucasfilm / Disney", "source": "https://www.starwars.com/databank/the-mandalorian/", "license": "© Lucasfilm / Disney", "licenseUrl": "https://www.starwars.com/databank/the-mandalorian/", "changes": "Materiał opublikowany przez wydawcę. Kadr dopasowany do portretu. Wszelkie prawa do postaci i materiału pozostają przy właścicielach."}, "position": "50% 15%", "thumbnailPosition": "50% 20%"},
];

/** Bohaterowie dostępni bez punktów; zachowujemy dawne klucze i ich kolejność. */
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
