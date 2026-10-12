import { avatarInfo, avatarName } from '../avatars';

/** Ten sam portret w sklepie, wyborze profilu i pasku ucznia; stare emoji nadal działają. */
export function AvatarPortrait({ value }: { value: string }) {
  const art = avatarInfo(value)?.art;
  return art ? <img className="avatar-portrait" src={`${import.meta.env.BASE_URL}${art}`} alt={avatarName(value)} width="240" height="280" loading="lazy" /> : <span aria-label={avatarName(value)}>{value.startsWith('hero:') ? '👤' : value}</span>;
}
