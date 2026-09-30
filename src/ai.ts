import { anthropicBody, chatPrompt, DEFAULT_MODEL, parseAnthropicResponse, type AiRequest, type AiResult } from '../supabase/functions/ai/prompt.ts';
import { store } from './data/store';

export type { AiRequest, AiResult };
export { chatPrompt };

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

export async function generateWithAi(req: AiRequest, pin: string): Promise<AiResult> {
  const mode = aiMode();
  if (mode === 'cloud') {
    const data = (await store.invokeAiFunction(req, pin)) as AiResult & { error?: string };
    if (data?.error) throw new Error(data.error);
    return data;
  }
  if (mode === 'direct') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': getLocalApiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify(anthropicBody(req, DEFAULT_MODEL)),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`Błąd API Claude (${res.status}): ${json?.error?.message ?? 'nieznany'}`);
    return parseAnthropicResponse(json);
  }
  throw new Error('AI nie jest skonfigurowane.');
}

/** Rozpoznaje odpowiedź wklejoną z czatu Claude (TYTUŁ/ZASADA + linie zadań). */
export function parsePastedAnswer(text: string): AiResult {
  const title = text.match(/^\s*TYTU[ŁL]\s*:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const description = text.match(/^\s*ZASADA\s*:\s*(.+)$/im)?.[1]?.trim() ?? '';
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^(wybierz|kliknij|sortuj|wpisz|pary)\s*:/i.test(l));
  return { title, description, dsl: lines.join('\n') };
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
