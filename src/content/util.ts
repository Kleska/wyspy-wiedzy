import type { Topic } from '../types';

const T0 = '2026-09-30T00:00:00.000Z';

export function builtin(id: string, subject: string, order: number, title: string, description: string, dsl: string, grades: number[] = [3]): Topic {
  return { id, subject, order, title, description, dsl: dsl.trim(), source: 'builtin', grades, createdAt: T0, updatedAt: T0 };
}
