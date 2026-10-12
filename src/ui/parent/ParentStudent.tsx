import { createContext, useContext } from 'react';

export const ParentStudentContext = createContext<{ studentId: string; selectStudent: (id: string) => void } | null>(null);

export function useParentStudent() {
  const context = useContext(ParentStudentContext);
  if (!context) throw new Error('Brak wyboru dziecka w panelu rodzica.');
  return context;
}
