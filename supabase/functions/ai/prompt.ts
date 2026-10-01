// Wspólne dla aplikacji (tryb bezpośredni, „skopiuj do Claude”) i funkcji w chmurze.
// Bez importów — plik musi działać zarówno w przeglądarce, jak i w Deno.

export const DEFAULT_MODEL = 'claude-sonnet-5-5';

export interface AiRequest {
  mode: 'text' | 'photo';
  request: string;
  subject: string;
  grade: number;
  count: number;
  types?: string[];
  /** Czytanie ze zrozumieniem: teksty z pytaniami. */
  reading?: boolean;
  images?: { mediaType: string; data: string }[];
}

export interface AiResult {
  title: string;
  description: string;
  /** Ściąga: dłuższe wyjaśnienie z przykładami. */
  guide?: string;
  dsl: string;
}

export function systemPrompt(grade: number): string {
  return `Jesteś doświadczonym nauczycielem szkoły podstawowej w Polsce. Tworzysz ćwiczenia do aplikacji do nauki dla ucznia klasy ${grade} szkoły podstawowej.

Zadania zapisujesz WYŁĄCZNIE w formacie tekstowym opisanym niżej — jedno zadanie w jednej linii, bez numeracji.

FORMAT
1) wybierz: Polecenie | *poprawna | błędna | błędna !! wyjaśnienie
   Wariant ze zdaniem: wybierz: Polecenie >> Zdanie z {wyróżnionym słowem} albo z luką ___ | *poprawna | błędna !! wyjaśnienie
   Dokładnie jedna odpowiedź z gwiazdką. 2–4 odpowiedzi.
2) kliknij: Polecenie >> Zdanie, w którym *poprawne* słowa otaczają gwiazdki. !! wyjaśnienie
   Oznacz WSZYSTKIE słowa spełniające polecenie (np. wszystkie rzeczowniki w zdaniu). Gwiazdki wokół pojedynczych słów.
3) sortuj: Polecenie >> grupa1 = słowo, słowo, słowo ; grupa2 = słowo, słowo, słowo !! wyjaśnienie
   2–3 grupy, 2–4 słowa w grupie, słowa się nie powtarzają.
4) wpisz: Polecenie >> Tekst z luką [odpowiedź|inna poprawna odpowiedź]. !! wyjaśnienie
   W nawiasie kwadratowym WSZYSTKIE akceptowane odpowiedzi rozdzielone znakiem |. Może być kilka luk.
5) pary: Polecenie >> lewa = prawa ; lewa = prawa ; lewa = prawa !! wyjaśnienie
   3–5 par, elementy się nie powtarzają.
6) dyktando: Polecenie >> Zdanie z wyrazem do wpisania w [nawiasie]. !! wyjaśnienie
   Aplikacja czyta całe zdanie na głos, a dziecko wpisuje wyraz z nawiasu. Luka nie może stać na początku zdania.
   Wyraz musi być jednoznaczny po usłyszeniu zdania (uważaj na wyrazy brzmiące tak samo: może / morze).
7) tekst: Tytuł >> Treść tekstu do przeczytania. // Drugi akapit.
   Czytanie ze zrozumieniem. Linia „tekst:” wprowadza tekst, a zadania POD nią (zwykle 5–8 typu „wybierz” albo „wpisz”)
   są pytaniami do tego tekstu — aż do następnej linii „tekst:”. Odpowiedź na każde pytanie musi wynikać z tekstu.
   Akapity oddzielaj „ // ”. Cały tekst w jednej linii.

PRZYKŁADY
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki | bardzo !! Biega — co robi? To czasownik.
wybierz: W jakim czasie jest czasownik? >> Wczoraj {pojechałem} rowerem. | *przeszłym | teraźniejszym | przyszłym !! „Wczoraj” — to już było.
kliknij: Kliknij wszystkie rzeczowniki. >> *Kot* śpi na *kanapie*. !! Kto śpi? Kot. Na czym? Na kanapie.
sortuj: Posegreguj słowa. >> rzeczownik = żaba, kredka ; czasownik = rysuje, śpi ; przymiotnik = zielona, szary !! Kto? co? — rzeczownik. Co robi? — czasownik. Jaki? — przymiotnik.
wpisz: Odmień czasownik „pisać”. >> ja piszę, ty [piszesz], oni [piszą] !! Oni piszą — na końcu „ą”.
pary: Połącz osobę z czasownikiem. >> ja = skaczę ; ty = skaczesz ; oni = skaczą !! Końcówka pokazuje, kto skacze.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Latem jedziemy nad [morze]. !! Morze — rz wymienia się na r: morski.
tekst: Jeż w ogrodzie >> Pewnego wieczoru Zosia zobaczyła w ogrodzie jeża. Zwierzątko szukało jedzenia pod krzakiem porzeczek. Zosia pobiegła po tatę. // Tata powiedział, że jeże jedzą ślimaki i owady, a mleko im szkodzi. Postawili więc przy krzaku miseczkę z wodą.
wybierz: Gdzie jeż szukał jedzenia? | *pod krzakiem porzeczek | pod drzewem | przy furtce !! W tekście: „pod krzakiem porzeczek”.

ZASADY
- Bezbłędna polszczyzna: ortografia, interpunkcja, odmiana. Sprawdź każde zadanie dwa razy, zanim je zapiszesz.
- Każde zadanie ma jedną jednoznaczną odpowiedź. Unikaj słów, które w innym kontekście są inną częścią mowy.
- Zdania krótkie, z życia dziecka (szkoła, dom, zwierzęta, sport, przyroda). Bez przemocy i treści dla dorosłych.
- Wyjaśnienie po „!!” to jedno krótkie zdanie, które uczy, DLACZEGO tak jest (np. pytanie pomocnicze).
- Mieszaj typy zadań, chyba że prośba mówi inaczej.
- Wewnątrz treści nie używaj znaków | >> !! ; = // inaczej niż wymaga format.
- Pole „description” to zasada dla dziecka: 1–2 proste zdania (pokazuje się jako podpowiedź).
- Pole „guide” to ściąga: 3–6 krótkich linii — reguła, sposób na zapamiętanie i 1–2 przykłady. Każda myśl w osobnej linii.
- Typ „dyktando” stosuj tylko do ćwiczeń z pisowni (ó/u, rz/ż, ch/h itp.) albo gdy rodzic o to prosi.
- Linię „tekst:” stosuj tylko do czytania ze zrozumieniem (gdy rodzic o to prosi). Długość tekstu dopasuj do wieku: klasy 1–3: 5–8 krótkich zdań; klasy 4–6: 8–14 zdań; starsze klasy: dłuższy tekst.
- Tytuł krótki (do 40 znaków).`;
}

function readingLine(count: number): string {
  const n = Math.max(1, Math.round(count / 7));
  const texts = n === 1 ? '1 tekst' : n < 5 ? `${n} teksty` : `${n} tekstów`;
  return `Czytanie ze zrozumieniem: napisz ${texts} (każdy w linii „tekst:”), a pod każdym 5–8 pytań. Łączna liczba pytań: ${count}.`;
}

export function userText(r: AiRequest): string {
  const lines = [
    `Przedmiot: ${r.subject}`,
    `Liczba zadań: ${r.count}`,
    `Typy zadań: ${r.types && r.types.length ? r.types.join(', ') : 'dowolne, mieszane'}`,
    ...(r.reading ? [readingLine(r.count)] : []),
    '',
    r.mode === 'photo'
      ? 'Na zdjęciach jest strona z podręcznika lub zeszytu ćwiczeń. Rozpoznaj, czego dotyczy (temat, zasada, przykłady) i ułóż NOWE zadania ćwiczące ten sam materiał. Możesz używać słów i przykładów ze zdjęcia, ale nie przepisuj długich fragmentów. Jeśli zdjęcie jest nieczytelne, napisz to w polu description i ułóż tyle zadań, ile się da.'
      : 'Ułóż zadania na temat opisany niżej.',
    '',
    `Prośba rodzica: ${r.request || '(brak dodatkowych uwag)'}`,
  ];
  return lines.join('\n');
}

export const TOOL = {
  name: 'zapisz_temat',
  description: 'Zapisuje gotowy temat z zadaniami w formacie tekstowym aplikacji.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Krótki tytuł tematu' },
      description: { type: 'string', description: 'Zasada dla dziecka (1–2 zdania)' },
      guide: { type: 'string', description: 'Ściąga: 3–6 krótkich linii z regułą i przykładami' },
      dsl: { type: 'string', description: 'Zadania w formacie tekstowym, jedno w linii' },
    },
    required: ['title', 'description', 'dsl'],
  },
} as const;

/** Treść zapytania do Anthropic Messages API. */
export function anthropicBody(r: AiRequest, model: string) {
  const content: unknown[] = [];
  for (const img of r.images ?? []) {
    content.push({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } });
  }
  content.push({ type: 'text', text: userText(r) });
  return {
    model,
    max_tokens: 6000,
    system: systemPrompt(r.grade),
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content }],
  };
}

/** Wyciąga wynik z odpowiedzi Messages API. */
export function parseAnthropicResponse(json: unknown): AiResult {
  const content = (json as { content?: { type: string; name?: string; input?: Record<string, unknown> }[] })?.content ?? [];
  const tool = content.find((c) => c.type === 'tool_use' && c.name === TOOL.name);
  if (!tool?.input) throw new Error('Model nie zwrócił zadań.');
  const i = tool.input;
  return {
    title: String(i.title ?? 'Nowy temat').slice(0, 80),
    description: String(i.description ?? ''),
    guide: i.guide ? String(i.guide) : undefined,
    dsl: String(i.dsl ?? ''),
  };
}

/** Polecenie do wklejenia w zwykłym czacie z Claude (bez klucza API). */
export function chatPrompt(r: AiRequest): string {
  return `${systemPrompt(r.grade)}

${userText(r)}

Odpowiedz w dokładnie takim układzie (bez niczego więcej):
TYTUŁ: ...
ZASADA: ...
ŚCIĄGA:
(3–6 krótkich linii)
\`\`\`
(tu zadania, jedno w linii)
\`\`\``;
}

// ─── Plan ze zdjęcia zakresu sprawdzianu ─────────────────────────────────────

export interface AiPlanRequest {
  mode: 'plan';
  request: string;
  subject: string;
  grade: number;
  /** Tematy, które już są w aplikacji (dla tej klasy i przedmiotu). */
  existing: { id: string; title: string }[];
  images?: { mediaType: string; data: string }[];
}

export interface AiPlanResult {
  planTitle: string;
  /** Zakres sprawdzianu w 1–2 zdaniach (co AI odczytało ze zdjęcia). */
  scope: string;
  existingTopicIds: string[];
  /** Nowy temat dla części zakresu, której nie ma w aplikacji (albo null). */
  topic: AiResult | null;
}

export function planUserText(r: AiPlanRequest): string {
  return [
    `Przedmiot: ${r.subject}`,
    '',
    'Na zdjęciach (albo w opisie rodzica) jest ZAKRES SPRAWDZIANU w szkole — np. kartka od nauczyciela, wpis w zeszycie albo wiadomość z dziennika.',
    '1) Odczytaj zakres i opisz go krótko (1–2 zdania).',
    '2) Wybierz z listy istniejących tematów te, które pasują do zakresu — podaj ich id (dokładnie tak, jak na liście).',
    '3) Jeśli jakiejś części zakresu nie obejmuje żaden temat z listy, ułóż JEDEN nowy temat (12–16 zadań) tylko z brakujących części — w formacie zadań, z zasadą i ściągą. Jeśli wszystko jest na liście, nie twórz nowego tematu.',
    '4) Nazwij plan krótko, np. „Sprawdzian: części mowy”.',
    '',
    'Istniejące tematy:',
    ...(r.existing.length ? r.existing.map((t) => `- ${t.id}: ${t.title}`) : ['(brak)']),
    '',
    `Uwagi rodzica: ${r.request || '(brak)'}`,
  ].join('\n');
}

export const PLAN_TOOL = {
  name: 'zapisz_plan',
  description: 'Zapisuje plan przygotowania do sprawdzianu: pasujące istniejące tematy i ewentualnie jeden nowy temat.',
  input_schema: {
    type: 'object',
    properties: {
      planTitle: { type: 'string', description: 'Krótka nazwa planu, np. „Sprawdzian: części mowy”' },
      scope: { type: 'string', description: 'Zakres sprawdzianu w 1–2 zdaniach' },
      existingTopicIds: { type: 'array', items: { type: 'string' }, description: 'Id pasujących tematów z listy' },
      newTopic: {
        type: 'object',
        description: 'Nowy temat dla brakującej części zakresu — pomiń, jeśli wszystko jest na liście',
        properties: TOOL.input_schema.properties,
        required: ['title', 'description', 'dsl'],
      },
    },
    required: ['planTitle', 'scope', 'existingTopicIds'],
  },
} as const;

export function anthropicPlanBody(r: AiPlanRequest, model: string) {
  const content: unknown[] = [];
  for (const img of r.images ?? []) {
    content.push({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } });
  }
  content.push({ type: 'text', text: planUserText(r) });
  return {
    model,
    max_tokens: 8000,
    system: systemPrompt(r.grade),
    tools: [PLAN_TOOL],
    tool_choice: { type: 'tool', name: PLAN_TOOL.name },
    messages: [{ role: 'user', content }],
  };
}

export function parseAnthropicPlan(json: unknown, existing: { id: string }[]): AiPlanResult {
  const content = (json as { content?: { type: string; name?: string; input?: Record<string, unknown> }[] })?.content ?? [];
  const tool = content.find((c) => c.type === 'tool_use' && c.name === PLAN_TOOL.name);
  if (!tool?.input) throw new Error('Model nie zwrócił planu.');
  const i = tool.input;
  const ids = new Set(existing.map((t) => t.id));
  const nt = i.newTopic as Record<string, unknown> | undefined;
  return {
    planTitle: String(i.planTitle ?? 'Sprawdzian').slice(0, 60),
    scope: String(i.scope ?? ''),
    existingTopicIds: (Array.isArray(i.existingTopicIds) ? i.existingTopicIds.map(String) : []).filter((id) => ids.has(id)),
    topic:
      nt && nt.dsl
        ? { title: String(nt.title ?? 'Nowy temat').slice(0, 80), description: String(nt.description ?? ''), guide: nt.guide ? String(nt.guide) : undefined, dsl: String(nt.dsl) }
        : null,
  };
}

/** Polecenie planu do wklejenia w zwykłym czacie z Claude (bez klucza API). */
export function chatPlanPrompt(r: AiPlanRequest): string {
  return `${systemPrompt(r.grade)}

${planUserText(r)}

Odpowiedz w dokładnie takim układzie (bez niczego więcej):
PLAN: ...
ZAKRES: ...
ISTNIEJĄCE: id, id (albo: brak)
TYTUŁ: ... (tytuł nowego tematu albo: brak — gdy nie trzeba nowego tematu)
ZASADA: ...
ŚCIĄGA:
(3–6 krótkich linii)
\`\`\`
(zadania nowego tematu, jedno w linii; zostaw puste, gdy nie ma nowego tematu)
\`\`\``;
}
