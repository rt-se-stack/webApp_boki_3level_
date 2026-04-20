export type Difficulty = 'low' | 'medium' | 'high';
export type QuestionType = 'choice' | 'journal';
export type QuizMode = 'choice' | 'journal';

export interface JournalLine {
  account: string;
  amount: number;
}

export interface JournalAnswer {
  debit: JournalLine[];
  credit: JournalLine[];
}

export interface Question {
  id: string;
  categoryId: number;
  categoryName: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  options?: string[];
  answer?: string;
  journalAnswer?: JournalAnswer;
  explanation: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface QuizSession {
  mode: QuizMode;
  categoryId: number;
  difficulty: Difficulty;
  questions: Question[];
  currentIndex: number;
  answers: (string | JournalAnswer | null)[];
  results: boolean[];
}

export interface CategoryProgress {
  categoryId: number;
  categoryName: string;
  choice: {
    low: { correct: number; total: number };
    medium: { correct: number; total: number };
    high: { correct: number; total: number };
  };
  journal: {
    low: { correct: number; total: number };
    medium: { correct: number; total: number };
    high: { correct: number; total: number };
  };
}

export type ProgressData = Record<number, CategoryProgress>;
