import { gradeOf, nowIso, store, uid } from './data/store';
import { buildExamQueue } from './engine';
import type { AssignedQuiz } from './types';

/** Jedna pula pytań, niezależne podejście każdego ucznia; całość walidowana przed zapisem. */
export async function assignQuizToProfiles(input: { profileIds: string[]; topicIds: string[]; count: number; title?: string; until?: string }) {
  const ids = [...new Set(input.profileIds)];
  if (!ids.length) throw new Error('Wybierz co najmniej jedno dziecko.');
  const profiles = ids.map((id) => store.get('profile', id));
  if (profiles.some((p) => !p || p.deleted)) throw new Error('Jeden z profili nie jest już dostępny. Wybierz odbiorców ponownie.');
  const children = profiles.filter((p) => !!p);
  if (children.some((p) => gradeOf(p) !== gradeOf(children[0]))) throw new Error('Wspólna kartkówka wymaga tej samej klasy.');
  const topicIds = [...new Set(input.topicIds)];
  if (!topicIds.length || !Number.isInteger(input.count) || input.count < 1 || input.count > 50) throw new Error('Wybierz tematy i liczbę pytań od 1 do 50.');
  const pools = children.map((p) => store.topicsFor(p.id).filter((t) => topicIds.includes(t.id)));
  if (pools.some((topics) => topics.length !== topicIds.length)) throw new Error('Wybrane tematy nie są dostępne dla wszystkich odbiorców. Sprawdź klasę i ustawienia tematów.');
  const common = pools[0].map((topic) => ({ ...topic, exercises: topic.exercises.filter((ex) => pools.every((pool) => pool.find((t) => t.id === topic.id)?.exercises.some((e) => e.id === ex.id))) }));
  const items = buildExamQueue(common, input.count).map(({ topicId, ex }) => ({ topicId, exerciseId: ex.id }));
  if (!items.length) throw new Error('W tych tematach nie ma dostępnych pytań.');
  const createdAt = nowIso();
  const batchId = uid();
  const quizzes: AssignedQuiz[] = children.map(() => ({ id: uid(), batchId, title: input.title?.trim() || (common.length === 1 ? common[0].title : 'Kartkówka'), topicIds, items, count: items.length, ...(input.until ? { until: input.until } : {}), createdAt }));
  await store.putMany('profile', children.map((p, index) => ({ ...p, quizzes: [...(p.quizzes ?? []), quizzes[index]], updatedAt: createdAt })));
  return { batchId, quizzes, names: children.map((p) => p.name), count: items.length };
}
