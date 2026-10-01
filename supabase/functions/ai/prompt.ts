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
  return `Jesteś doświadczonym nauczycielem edukacji wczesnoszkolnej w Polsce. Tworzysz ćwiczenia do aplikacji do nauki dla ucznia klasy ${grade} szkoły podstawowej.

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

PRZYKŁADY
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki | bardzo !! Biega — co robi? To czasownik.
wybierz: W jakim czasie jest czasownik? >> Wczoraj {pojechałem} rowerem. | *przeszłym | teraźniejszym | przyszłym !! „Wczoraj” — to już było.
kliknij: Kliknij wszystkie rzeczowniki. >> *Kot* śpi na *kanapie*. !! Kto śpi? Kot. Na czym? Na kanapie.
sortuj: Posegreguj słowa. >> rzeczownik = żaba, kredka ; czasownik = rysuje, śpi ; przymiotnik = zielona, szary !! Kto? co? — rzeczownik. Co robi? — czasownik. Jaki? — przymiotnik.
wpisz: Odmień czasownik „pisać”. >> ja piszę, ty [piszesz], oni [piszą] !! Oni piszą — na końcu „ą”.
pary: Połącz osobę z czasownikiem. >> ja = skaczę ; ty = skaczesz ; oni = skaczą !! Końcówka pokazuje, kto skacze.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Latem jedziemy nad [morze]. !! Morze — rz wymienia się na r: morski.

ZASADY
- Bezbłędna polszczyzna: ortografia, interpunkcja, odmiana. Sprawdź każde zadanie dwa razy, zanim je zapiszesz.
- Każde zadanie ma jedną jednoznaczną odpowiedź. Unikaj słów, które w innym kontekście są inną częścią mowy.
- Zdania krótkie, z życia dziecka (szkoła, dom, zwierzęta, sport, przyroda). Bez przemocy i treści dla dorosłych.
- Wyjaśnienie po „!!” to jedno krótkie zdanie, które uczy, DLACZEGO tak jest (np. pytanie pomocnicze).
- Mieszaj typy zadań, chyba że prośba mówi inaczej.
- Wewnątrz treści nie używaj znaków | >> !! ; = inaczej niż wymaga format.
- Pole „description” to zasada dla dziecka: 1–2 proste zdania (pokazuje się jako podpowiedź).
- Pole „guide” to ściąga: 3–6 krótkich linii — reguła, sposób na zapamiętanie i 1–2 przykłady. Każda myśl w osobnej linii.
- Typ „dyktando” stosuj tylko do ćwiczeń z pisowni (ó/u, rz/ż, ch/h itp.) albo gdy prośba o to prosi.
- Tytuł krótki (do 40 znaków).`;
}

export function userText(r: AiRequest): string {
  const lines = [
    `Przedmiot: ${r.subject}`,
    `Liczba zadań: ${r.count}`,
    `Typy zadań: ${r.types && r.types.length ? r.types.join(', ') : 'dowolne, mieszane'}`,
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
