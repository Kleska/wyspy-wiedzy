// Czytanie na głos (Web Speech API) i krótkie dźwięki (Web Audio).

import type { Lang } from './types';

const LOCALE: Record<Lang, string> = { pl: 'pl-PL', en: 'en-GB' };
/** Ulubione głosy: polskie oraz brytyjskie (podręczniki uczą pisowni i wymowy brytyjskiej). */
const PREFERRED: Record<Lang, RegExp> = {
  pl: /zosia|paulina|ewa|maja|google/i,
  en: /daniel|serena|kate|martha|libby|sonia|hazel|uk english|google/i,
};
const voices: Partial<Record<Lang, SpeechSynthesisVoice | null>> = {};

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const all = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().replace('_', '-').startsWith(lang));
  // Po angielsku najpierw głosy brytyjskie, potem pozostałe.
  const local = lang === 'en' ? all.filter((v) => /^en[-_]gb/i.test(v.lang)) : all;
  const v = local.find((x) => PREFERRED[lang].test(x.name)) ?? local[0] ?? all.find((x) => PREFERRED[lang].test(x.name)) ?? all[0] ?? null;
  voices[lang] = v;
  return v;
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice('pl');
  pickVoice('en');
  speechSynthesis.onvoiceschanged = () => {
    pickVoice('pl');
    pickVoice('en');
  };
}

export function canSpeak() {
  return typeof speechSynthesis !== 'undefined';
}

/** Czy przeglądarka ma głos w tym języku (bez niego dyktando pokazuje wyraz z ukrytymi literami). */
export function hasVoice(lang: Lang = 'pl'): boolean {
  if (!canSpeak()) return false;
  return !!(voices[lang] ?? pickVoice(lang));
}

export interface SpeechPart {
  text: string;
  lang?: Lang;
}

/** Czyta kolejno kilka fragmentów — każdy głosem w swoim języku (polecenie po polsku, zdanie po angielsku). */
export function speakParts(parts: SpeechPart[], rate = 0.92) {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  for (const p of parts) {
    if (!p.text.trim()) continue;
    const lang = p.lang ?? 'pl';
    const u = new SpeechSynthesisUtterance(p.text);
    const v = voices[lang] ?? pickVoice(lang);
    u.lang = v?.lang ?? LOCALE[lang];
    u.rate = rate;
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
}

export function speak(text: string, rate = 0.92, lang: Lang = 'pl') {
  speakParts([{ text, lang }], rate);
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel();
}

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

export function playSound(kind: 'good' | 'bad' | 'done') {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    if (kind === 'good') {
      tone(660, 0, 0.12, 'triangle');
      tone(990, 0.1, 0.18, 'triangle');
    } else if (kind === 'bad') {
      tone(220, 0, 0.22, 'sine', 0.1);
    } else {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.22, 'triangle'));
    }
  } catch {
    /* dźwięk to tylko dodatek */
  }
}
