'use client';
import { useState, useCallback, useMemo } from 'react';
import questionsData from '@/data/questions.json';
import type { Question, Difficulty, QuizMode, JournalAnswer } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeAccount(s: string) {
  return s.replace(/\s/g, '').toLowerCase();
}

export function checkJournalAnswer(userAnswer: JournalAnswer, correct: JournalAnswer): boolean {
  if (userAnswer.debit.length !== correct.debit.length) return false;
  if (userAnswer.credit.length !== correct.credit.length) return false;
  const matchLines = (user: JournalAnswer['debit'], ans: JournalAnswer['debit']) => {
    const sorted = (arr: typeof ans) => [...arr].sort((a, b) => a.account.localeCompare(b.account));
    const u = sorted(user);
    const a = sorted(ans);
    return u.every((l, i) =>
      normalizeAccount(l.account) === normalizeAccount(a[i].account) &&
      Number(l.amount) === Number(a[i].amount)
    );
  };
  return matchLines(userAnswer.debit, correct.debit) && matchLines(userAnswer.credit, correct.credit);
}

export function useQuiz(categoryId: number, difficulty: Difficulty, mode: QuizMode) {
  const questions = useMemo<Question[]>(() => {
    const all = questionsData as Question[];
    const filtered = all.filter(
      q => q.categoryId === categoryId && q.difficulty === difficulty && q.type === mode
    );
    return shuffle(filtered);
  }, [categoryId, difficulty, mode]);

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const current = questions[index] ?? null;

  const submitAnswer = useCallback((answer: string | JournalAnswer) => {
    if (!current) return false;
    let correct = false;
    if (mode === 'choice') {
      correct = (answer as string) === current.answer;
    } else {
      correct = checkJournalAnswer(answer as JournalAnswer, current.journalAnswer!);
    }
    const newResults = [...results, correct];
    setResults(newResults);
    return correct;
  }, [current, mode, results]);

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
    }
  }, [index, questions.length]);

  const score = results.filter(Boolean).length;

  return { current, index, total: questions.length, results, finished, score, submitAnswer, next };
}
