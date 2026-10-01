import type { ThemeId } from './types';

export interface ThemeDef {
  id: ThemeId;
  name: string;
  appName: string;
  tagline: string;
  layout: 'map' | 'route' | 'grid' | 'list';
  /** Formy liczebnikowe waluty: 1, 2–4, 5+ */
  coin: [string, string, string];
  topicWord: string;
  start: string;
  hello: string;
  praise: string[];
  oops: string;
  levelLabel: (level: number) => string;
  swatch: [string, string, string];
  themeColor: string;
}

const PILOT_RANKS = ['Kadet', 'Pilot', 'Starszy pilot', 'Kapitan', 'Major', 'Pułkownik', 'Generał', 'As przestworzy'];

export const THEMES: Record<ThemeId, ThemeDef> = {
  wyspy: {
    id: 'wyspy',
    name: 'Wyspy Wiedzy',
    appName: 'Wyspy Wiedzy',
    tagline: 'Mapa przygody, skrzynie i muszelki',
    layout: 'map',
    coin: ['muszelka', 'muszelki', 'muszelek'],
    topicWord: 'kraina',
    start: 'Graj!',
    hello: 'Cześć',
    praise: ['Brawo!', 'Super!', 'Świetnie!', 'Tak trzymaj!', 'Ekstra!'],
    oops: 'Prawie! Zobacz, jak jest dobrze:',
    levelLabel: (l) => `Poziom ${l}`,
    swatch: ['#BFE6DC', '#F7E4B5', '#E0512E'],
    themeColor: '#BFE6DC',
  },
  piloci: {
    id: 'piloci',
    name: 'Akademia Pilotów',
    appName: 'Akademia Pilotów',
    tagline: 'Trasy lotów, hangar i stopnie pilota',
    layout: 'route',
    coin: ['moneta', 'monety', 'monet'],
    topicWord: 'misja',
    start: 'Startuj!',
    hello: 'Cześć',
    praise: ['Czyste lądowanie!', 'Idealny kurs!', 'Brawo, pilocie!', 'Pełna moc!'],
    oops: 'Turbulencje! Poprawny kurs:',
    levelLabel: (l) => PILOT_RANKS[Math.min(PILOT_RANKS.length - 1, Math.floor((l - 1) / 2))] + ` · poz. ${l}`,
    swatch: ['#D8EDFA', '#0E2A47', '#F5A524'],
    themeColor: '#0E2A47',
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel Quest',
    appName: 'PIXEL QUEST',
    tagline: 'Światy, etapy, combo i ekwipunek',
    layout: 'grid',
    coin: ['moneta', 'monety', 'monet'],
    topicWord: 'etap',
    start: 'GRAJ ▶',
    hello: 'Hej',
    praise: ['TRAFIONY!', 'PERFEKT!', 'COMBO!', 'BOOM!'],
    oops: 'PUDŁO! Poprawnie:',
    levelLabel: (l) => `LVL ${l}`,
    swatch: ['#141A2E', '#20284A', '#A6E35A'],
    themeColor: '#141A2E',
  },
  zeszyt: {
    id: 'zeszyt',
    name: 'Zeszyt',
    appName: 'zeszyt.',
    tagline: 'Spokojnie i konkretnie — na starsze lata',
    layout: 'list',
    coin: ['punkt', 'punkty', 'punktów'],
    topicWord: 'temat',
    start: 'Zacznij',
    hello: 'Dzień dobry',
    praise: ['Dobrze.', 'Świetnie.', 'Tak jest.', 'Bardzo dobrze.'],
    oops: 'Nie tym razem. Poprawnie:',
    levelLabel: (l) => `Poziom ${l}`,
    swatch: ['#FAF7F0', '#1E2A3A', '#1F5FD6'],
    themeColor: '#FAF7F0',
  },
};

export const THEME_ORDER: ThemeId[] = ['wyspy', 'piloci', 'pixel', 'zeszyt'];

export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n);
  if (abs === 1) return forms[0];
  const l10 = abs % 10;
  const l100 = abs % 100;
  if (l10 >= 2 && l10 <= 4 && (l100 < 12 || l100 > 14)) return forms[1];
  return forms[2];
}

export function coinText(n: number, theme: ThemeDef): string {
  return `${n} ${plural(n, theme.coin)}`;
}

const loaded = new Set<ThemeId>();

/** Czcionki ładowane z paczki aplikacji (działa offline, bez Google Fonts). */
export async function loadThemeFonts(id: ThemeId) {
  if (loaded.has(id)) return;
  loaded.add(id);
  switch (id) {
    case 'wyspy':
      await Promise.all([
        import('@fontsource/fredoka/latin-500.css'),
        import('@fontsource/fredoka/latin-ext-500.css'),
        import('@fontsource/fredoka/latin-600.css'),
        import('@fontsource/fredoka/latin-ext-600.css'),
        import('@fontsource/fredoka/latin-700.css'),
        import('@fontsource/fredoka/latin-ext-700.css'),
        import('@fontsource/nunito/latin-600.css'),
        import('@fontsource/nunito/latin-ext-600.css'),
        import('@fontsource/nunito/latin-800.css'),
        import('@fontsource/nunito/latin-ext-800.css'),
      ]);
      break;
    case 'piloci':
      await Promise.all([
        import('@fontsource/chakra-petch/latin-600.css'),
        import('@fontsource/chakra-petch/latin-ext-600.css'),
        import('@fontsource/chakra-petch/latin-700.css'),
        import('@fontsource/chakra-petch/latin-ext-700.css'),
        import('@fontsource/nunito/latin-600.css'),
        import('@fontsource/nunito/latin-ext-600.css'),
        import('@fontsource/nunito/latin-800.css'),
        import('@fontsource/nunito/latin-ext-800.css'),
      ]);
      break;
    case 'pixel':
      // Litery pikselowe, cyfry z Rubika (czytelne) — patrz pixelFont.ts.
      await Promise.all([
        import('./pixelFont').then((m) => m.registerPixelLetters()),
        import('@fontsource/rubik/latin-500.css'),
        import('@fontsource/rubik/latin-ext-500.css'),
        import('@fontsource/rubik/latin-700.css'),
        import('@fontsource/rubik/latin-ext-700.css'),
      ]);
      break;
    case 'zeszyt':
      await Promise.all([
        import('@fontsource/lexend/latin-400.css'),
        import('@fontsource/lexend/latin-ext-400.css'),
        import('@fontsource/lexend/latin-600.css'),
        import('@fontsource/lexend/latin-ext-600.css'),
        import('@fontsource/lexend/latin-700.css'),
        import('@fontsource/lexend/latin-ext-700.css'),
        import('@fontsource/caveat/latin-700.css'),
        import('@fontsource/caveat/latin-ext-700.css'),
      ]);
      break;
  }
}
