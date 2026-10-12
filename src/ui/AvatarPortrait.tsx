import { useEffect, useState } from 'react';
import { avatarInfo, avatarName } from '../avatars';

/** Miniatura do profilu; pełny portret do kolekcji i powiększenia. Stare klucze pozostają zgodne. */
export function AvatarPortrait({ value, variant = 'icon' }: { value: string; variant?: 'icon' | 'card' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [value, variant]);
  const avatar = avatarInfo(value);
  const art = variant === 'icon' ? avatar?.thumbnail ?? avatar?.art : avatar?.art;
  if (failed) return <span className="avatar-unavailable">Grafika niedostępna</span>;
  const src = art?.startsWith('https://') ? art : `${import.meta.env.BASE_URL}${art}`;
  return art ? <img className="avatar-portrait" src={src} style={{ objectPosition: variant === 'icon' ? avatar?.thumbnailPosition ?? avatar?.position : avatar?.position }} onError={() => setFailed(true)} referrerPolicy="no-referrer" alt={avatarName(value)} width="600" height="700" loading="lazy" decoding="async" /> : <span aria-label={avatarName(value)}>{value.startsWith('hero:') ? '👤' : value}</span>;
}

export function AvatarCredit({ value }: { value: string }) {
  const credit = avatarInfo(value)?.credit;
  if (!credit) return null;
  return <details className="avatar-credit"><summary>Źródło grafiki</summary><div className="col"><span>{credit.author}</span><a href={credit.source} target="_blank" rel="noopener noreferrer">Otwórz źródło</a><a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a><span>{credit.changes}</span></div></details>;
}
