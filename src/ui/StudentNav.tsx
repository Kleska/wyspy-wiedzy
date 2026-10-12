import { useApp, type Screen } from './hooks';
import { Icon, type IconName } from './icons';

export function StudentNav({ screen }: { screen: Screen }) {
  const { go } = useApp();
  const active =
    screen.name === 'rewards'
      ? 'rewards'
      : screen.name === 'subject' || screen.name === 'times'
        ? 'subjects'
        : screen.name === 'home'
          ? (screen.section ?? 'today')
          : '';
  const items: { id: string; label: string; icon: IconName; screen: Screen }[] = [
    { id: 'today', label: 'Dzisiaj', icon: 'flag', screen: { name: 'home' } },
    { id: 'subjects', label: 'Nauka', icon: 'book', screen: { name: 'home', section: 'subjects' } },
    { id: 'games', label: 'Gry', icon: 'zap', screen: { name: 'home', section: 'games' } },
    { id: 'progress', label: 'Postępy', icon: 'chart', screen: { name: 'home', section: 'progress' } },
    { id: 'rewards', label: 'Nagrody', icon: 'gift', screen: { name: 'rewards' } },
  ];
  return (
    <nav className="student-nav" aria-label="Menu ucznia">
      {items.map((it) => (
        <button type="button" key={it.id} aria-current={active === it.id ? 'page' : undefined} onClick={() => active !== it.id && go(it.screen)}>
          <Icon name={it.icon} size={22} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
