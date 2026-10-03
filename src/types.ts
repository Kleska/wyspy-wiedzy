// ─── Ćwiczenia ────────────────────────────────────────────────────────────────

export type ExerciseType = 'choice' | 'tap' | 'sort' | 'fill' | 'match' | 'dictation';

interface ExerciseBase {
  id: string;
  type: ExerciseType;
  /** Polecenie, np. „Kliknij wszystkie czasowniki.” */
  prompt: string;
  /** Wyjaśnienie pokazywane po odpowiedzi (i jako podpowiedź). */
  explain?: string;
  /** Podpowiedź do tego zadania (po „??”), np. tłumaczenie zdania. Widać ją po stuknięciu „Podpowiedź”. */
  hint?: string;
  /** Czytanie ze zrozumieniem: tekst, którego dotyczy pytanie (linia „tekst:” nad pytaniami). */
  passage?: Passage;
}

export interface Passage {
  title: string;
  /** Akapity rozdzielone „ // ”. */
  text: string;
}

/** Wybór jednej odpowiedzi. `sentence` może zawierać {wyróżnienie} i ___ (luka). */
export interface ChoiceExercise extends ExerciseBase {
  type: 'choice';
  sentence?: string;
  options: string[];
  correct: number;
}

/** Klikanie słów w zdaniu (np. wszystkie rzeczowniki). */
export interface TapExercise extends ExerciseBase {
  type: 'tap';
  tokens: string[];
  correct: number[];
}

/** Sortowanie słów do koszyków. */
export interface SortExercise extends ExerciseBase {
  type: 'sort';
  categories: string[];
  items: { text: string; cat: number }[];
}

/** Uzupełnianie luk. Element tablicy: tekst albo luka (lista akceptowanych odpowiedzi). */
export interface FillExercise extends ExerciseBase {
  type: 'fill';
  parts: (string | string[])[];
}

/** Łączenie w pary. */
export interface MatchExercise extends ExerciseBase {
  type: 'match';
  pairs: [string, string][];
}

/**
 * Dyktando: aplikacja czyta cały tekst na głos (z odpowiedziami), a dziecko wpisuje
 * brakujące wyrazy. Budowa jak w uzupełnianiu luk.
 */
export interface DictationExercise extends ExerciseBase {
  type: 'dictation';
  parts: (string | string[])[];
}

export type Exercise = ChoiceExercise | TapExercise | SortExercise | FillExercise | MatchExercise | DictationExercise;

// ─── Tematy ───────────────────────────────────────────────────────────────────

export type TopicSource = 'builtin' | 'manual' | 'ai' | 'photo' | 'import';

export interface Topic {
  id: string;
  subject: string;
  title: string;
  /** Krótka zasada (1–2 zdania) — podpowiedź w trakcie ćwiczenia. */
  description?: string;
  /** Ściąga: dłuższe wyjaśnienie z przykładami, pokazywane przed tematem i po błędzie. */
  guide?: string;
  /** Słówka (język obcy): linie „english = polski”. Lista do nauki i źródło podpowiedzi do słów w zdaniach. */
  words?: string;
  order: number;
  source: TopicSource;
  /** Dla których klas (puste/brak = dla wszystkich). */
  grades?: number[];
  /** Treść w formacie tekstowym (źródło prawdy dla edytora). */
  dsl: string;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Temat po sparsowaniu — gotowy do ćwiczeń. */
export interface ParsedTopic extends Topic {
  exercises: Exercise[];
  errors: DslError[];
  builtin: boolean;
}

export interface DslError {
  line: number;
  text: string;
  message: string;
}

/** Język treści zadań: decyduje o głosie do czytania i o pomocniczych klawiszach przy wpisywaniu. */
export type Lang = 'pl' | 'en';

export interface Subject {
  id: string;
  name: string;
  short: string;
  island: string;
  /** Język obcy: zdania czyta głos w tym języku (polecenia nadal po polsku). */
  lang?: Lang;
}

// ─── Postępy (dziennik zdarzeń — synchronizuje się bez konfliktów) ────────────

export interface Attempt {
  id: string;
  profileId: string;
  sessionId: string;
  topicId: string;
  exerciseId: string;
  correct: boolean;
  /** Druga próba w tej samej sesji (po błędzie). */
  retry: boolean;
  hint: boolean;
  ms: number;
  at: string;
  /** Co dziecko odpowiedziało (zapisujemy tylko błędne odpowiedzi — do raportu dla rodzica). */
  answer?: string;
}

/**
 * topic — ćwiczenie tematu, review — powtórka, test — sprawdzian z oceną,
 * diagnostic — test na start, gen — trening bez końca (zadania losowane),
 * fix — poprawa błędów ze sprawdzianu, sprint — Błyskawica (60 sekund), pairs — Pary na czas.
 */
export type SessionMode = 'topic' | 'review' | 'test' | 'diagnostic' | 'gen' | 'fix' | 'sprint' | 'pairs';

export interface Session {
  id: string;
  profileId: string;
  topicId: string | null;
  mode: SessionMode;
  /** Tematy sprawdzianu / testu na start. */
  topicIds?: string[];
  /** Generator zadań (trening bez końca) albo klucz minigry (Błyskawica, Pary na czas). */
  genId?: string;
  /** Pary na czas: czas ułożenia wszystkich par w milisekundach (z karami). */
  durationMs?: number;
  startedAt: string;
  endedAt: string | null;
  activeSeconds: number;
  answered: number;
  correct: number;
  completed: boolean;
}

export interface Redemption {
  id: string;
  profileId: string;
  rewardId: string;
  title: string;
  cost: number;
  /** Nagrody wirtualne są od razu „approved”. Prawdziwe czekają na rodzica. */
  status: 'pending' | 'approved' | 'rejected';
  real: boolean;
  at: string;
  decidedAt?: string | null;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
}

export type ThemeId = 'wyspy' | 'piloci' | 'pixel' | 'zeszyt';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  theme: ThemeId;
  /** Klasa szkolna (1–8). Starsze profile bez klasy traktujemy jak klasę 3. */
  grade?: number;
  /** Własny cel dzienny w minutach (gdy brak — ustawienie rodziny). */
  dailyGoalMinutes?: number;
  /** Profil usunięty (zostaje w bazie, żeby synchronizacja działała bez konfliktów). */
  deleted?: boolean;
  /** Postępy liczone od tej chwili („Zacznij od nowa”). */
  resetAt?: string;
  /** Plan od rodzica: tematy na najbliższy czas (np. przed sprawdzianem). */
  plan?: Plan | null;
  /** Kiedy rodzic ostatnio ustawił albo usunął plan — przy scalaniu zmian z dwóch urządzeń wygrywa późniejszy plan. */
  planAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  topicIds: string[];
  /** Termin (RRRR-MM-DD), np. dzień sprawdzianu w szkole. */
  until?: string;
  /** Np. „Sprawdzian z ułamków”. */
  title?: string;
  setAt: string;
}

/** Wspólny cel rodzeństwa: razem zbierają dobre odpowiedzi na jedną nagrodę. */
export interface FamilyGoal {
  id: string;
  title: string;
  /** Ile dobrych odpowiedzi trzeba zebrać razem. */
  target: number;
  startAt: string;
}

export interface Settings {
  id: 'family';
  parentPinHash?: string;
  pinSalt?: string;
  dailyGoalMinutes: number;
  sessionLength: number;
  autoRead: boolean;
  sounds: boolean;
  hiddenBuiltins: string[];
  rewards: Reward[];
  familyGoal?: FamilyGoal | null;
  updatedAt: string;
}

export type DocKind = 'profile' | 'topic' | 'attempt' | 'session' | 'redemption' | 'settings';

export interface DocMap {
  profile: Profile;
  topic: Topic;
  attempt: Attempt;
  session: Session;
  redemption: Redemption;
  settings: Settings;
}
