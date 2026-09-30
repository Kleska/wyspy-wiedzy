// Czytanie na głos (Web Speech API) i krótkie dźwięki (Web Audio).

let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('pl'));
  voice = voices.find((v) => /zosia|paulina|ewa|maja|google/i.test(v.name)) ?? voices[0] ?? null;
  return voice;
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  speechSynthesis.onvoiceschanged = () => pickVoice();
}

export function canSpeak() {
  return typeof speechSynthesis !== 'undefined';
}

export function speak(text: string) {
  if (!canSpeak() || !text.trim()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pl-PL';
  u.rate = 0.92;
  const v = voice ?? pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
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
