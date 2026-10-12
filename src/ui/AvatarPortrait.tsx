import { avatarInfo, avatarName } from '../avatars';

/** Miniatura do profilu; pełny portret do kolekcji i powiększenia. Stare klucze pozostają zgodne. */
export function AvatarPortrait({ value, variant = 'icon' }: { value: string; variant?: 'icon' | 'card' }) {
  const avatar = avatarInfo(value);
  const art = variant === 'icon' ? avatar?.thumbnail ?? avatar?.art : avatar?.art;
  return art ? <img className="avatar-portrait" src={`${import.meta.env.BASE_URL}${art}`} alt={avatarName(value)} width="600" height="700" loading="lazy" decoding="async" /> : <span aria-label={avatarName(value)}>{value.startsWith('hero:') ? '👤' : value}</span>;
}

export function AvatarCredit({ value }: { value: string }) {
  const credit = avatarInfo(value)?.credit;
  if (!credit) return null;
  return <small className="avatar-credit">Fot. {credit.author} · <a href={credit.source} target="_blank" rel="noopener noreferrer">Źródło</a> · <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a><span>{credit.changes}</span></small>;
}
