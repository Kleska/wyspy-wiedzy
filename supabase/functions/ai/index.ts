// Supabase Edge Function „ai” — generuje zadania przez Claude (tekst lub zdjęcie z książki).
//
// Sekrety (Supabase → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY  — klucz z console.anthropic.com
//   PARENT_PIN         — ten sam PIN, którego używasz w panelu rodzica
//   ANTHROPIC_MODEL    — opcjonalnie, domyślnie claude-sonnet-5-5
//   ALLOWED_ORIGIN     — opcjonalnie, np. https://twoj-login.github.io
//
// Funkcja wymaga zalogowanego konta rodziny (JWT sprawdza Supabase) ORAZ PIN-u rodzica,
// więc dziecko nie wyda środków z konta API.

import { anthropicBody, DEFAULT_MODEL, parseAnthropicResponse, type AiRequest } from './prompt.ts';

const ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
const CORS = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-parent-pin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Tylko POST' }, 405);

  const pin = Deno.env.get('PARENT_PIN');
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!pin || !apiKey) return json({ error: 'Brakuje sekretów PARENT_PIN lub ANTHROPIC_API_KEY w Supabase.' }, 500);
  if (!safeEqual(req.headers.get('x-parent-pin') ?? '', pin)) return json({ error: 'Zły PIN rodzica.' }, 403);

  let body: AiRequest & { ping?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Nieprawidłowe dane.' }, 400);
  }
  if (body.ping) return json({ ok: true });

  const images = (body.images ?? []).slice(0, 4).filter((i) => /^image\/(jpeg|png|webp|gif)$/.test(i.mediaType) && i.data.length < 7_000_000);
  const request: AiRequest = {
    mode: body.mode === 'photo' ? 'photo' : 'text',
    request: String(body.request ?? '').slice(0, 2000),
    subject: String(body.subject ?? 'Polski').slice(0, 40),
    grade: Math.min(8, Math.max(1, Number(body.grade) || 3)),
    count: Math.min(30, Math.max(3, Number(body.count) || 12)),
    types: Array.isArray(body.types) ? body.types.slice(0, 5).map(String) : undefined,
    images,
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify(anthropicBody(request, Deno.env.get('ANTHROPIC_MODEL') ?? DEFAULT_MODEL)),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return json({ error: `Błąd API Claude (${res.status}): ${data?.error?.message ?? 'nieznany'}` }, 502);
  try {
    return json(parseAnthropicResponse(data));
  } catch (e) {
    return json({ error: String(e instanceof Error ? e.message : e) }, 502);
  }
});
