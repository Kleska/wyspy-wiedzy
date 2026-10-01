import {
  anthropicBody,
  anthropicPlanBody,
  chatPlanPrompt,
  chatPrompt,
  DEFAULT_MODEL,
  parseAnthropicPlan,
  parseAnthropicResponse,
  type AiPlanRequest,
  type AiPlanResult,
  type AiRequest,
  type AiResult,
} from '../supabase/functions/ai/prompt.ts';
import { store } from './data/store';

export type { AiPlanRequest, AiPlanResult, AiRequest, AiResult };
export { chatPlanPrompt, chatPrompt };

const KEY_STORAGE = 'ww-anthropic-key';

export function getLocalApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function setLocalApiKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

export type AiMode = 'cloud' | 'direct' | 'none';

export function aiMode(): AiMode {
  if (getLocalApiKey()) return 'direct';
  if (store.aiViaCloud) return 'cloud';
  return 'none';
}

async function callDirect(body: unknown): Promise<unknown> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': getLocalApiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Błąd API Claude (${res.status}): ${json?.error?.message ?? 'nieznany'}`);
  return json;
}

export async function generateWithAi(req: AiRequest, pin: string): Promise<AiResult> {
  const mode = aiMode();
  if (mode === 'cloud') {
    const data = (await store.invokeAiFunction(req, pin)) as AiResult & { error?: string };
    if (data?.error) throw new Error(data.error);
    return data;
  }
  if (mode === 'direct') return parseAnthropicResponse(await callDirect(anthropicBody(req, DEFAULT_MODEL)));
  throw new Error('AI nie jest skonfigurowane.');
}

/** Plan przygotowania do sprawdzianu ze zdjęcia zakresu. */
export async function generatePlanWithAi(req: AiPlanRequest, pin: string): Promise<AiPlanResult> {
  const mode = aiMode();
  if (mode === 'cloud') {
    const data = (await store.invokeAiFunction(req, pin)) as AiPlanResult & { error?: string };
    if (data?.error) throw new Error(data.error);
    return data;
  }
  if (mode === 'direct') return parseAnthropicPlan(await callDirect(anthropicPlanBody(req, DEFAULT_MODEL)), req.existing);
  throw new Error('AI nie jest skonfigurowane.');
}

const TASK_LINE = /^(wybierz|kliknij|sortuj|wpisz|pary|dyktando|tekst)\s*:/i;

/** Rozpoznaje odpowiedź wklejoną z czatu Claude (TYTUŁ/ZASADA/ŚCIĄGA + linie zadań). */
export function parsePastedAnswer(text: string): AiResult {
  const title = text.match(/^\s*TYTU[ŁL]\s*:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const description = text.match(/^\s*ZASADA\s*:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const all = text.split(/\r?\n/).map((l) => l.trim());
  const lines = all.filter((l) => TASK_LINE.test(l));
  // Ściąga: od „ŚCIĄGA:” do bloku kodu albo pierwszej linii z zadaniem.
  const guide: string[] = [];
  const start = all.findIndex((l) => /^\**\s*[ŚS]CI[ĄA]GA\s*:?/i.test(l));
  if (start >= 0) {
    const first = all[start].replace(/^\**\s*[ŚS]CI[ĄA]GA\s*:?\**\s*/i, '');
    if (first) guide.push(first);
    for (const l of all.slice(start + 1)) {
      if (l.startsWith('```') || TASK_LINE.test(l) || /^(TYTU[ŁL]|ZASADA|PLAN|ZAKRES|ISTNIEJ[ĄA]CE)\s*:/i.test(l)) break;
      if (l) guide.push(l);
    }
  }
  return { title, description, guide: guide.join('\n') || undefined, dsl: lines.join('\n') };
}

/** Rozpoznaje plan wklejony z czatu Claude (PLAN/ZAKRES/ISTNIEJĄCE + opcjonalnie nowy temat). */
export function parsePastedPlan(text: string, existing: { id: string }[]): AiPlanResult {
  const line = (re: RegExp) => text.match(re)?.[1]?.trim() ?? '';
  const ids = new Set(existing.map((t) => t.id));
  const listed = line(/^\s*ISTNIEJ[ĄA]CE\s*:\s*(.+)$/im);
  const topic = parsePastedAnswer(text);
  const noTopic = !topic.dsl || /^brak/i.test(topic.title);
  return {
    planTitle: line(/^\s*PLAN\s*:\s*(.+)$/im) || 'Sprawdzian',
    scope: line(/^\s*ZAKRES\s*:\s*(.+)$/im),
    existingTopicIds: /^brak/i.test(listed)
      ? []
      : listed
          .split(/[,;\s]+/)
          .map((x) => x.trim())
          .filter((x) => ids.has(x)),
    topic: noTopic ? null : { ...topic, title: topic.title || 'Nowy temat' },
  };
}

/** Zmniejsza zdjęcie (dłuższy bok ≤ 1600 px) i zwraca JPEG w base64. */
export async function imageToBase64(file: File): Promise<{ mediaType: string; data: string; preview: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Nie udało się wczytać zdjęcia.'));
      i.src = url;
    });
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return { mediaType: 'image/jpeg', data: dataUrl.split(',')[1], preview: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}
