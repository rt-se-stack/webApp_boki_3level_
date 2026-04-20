'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Difficulty, QuizMode } from '@/types';

const STORAGE_KEY = 'bookkeeping_progress';

interface SessionResult {
  categoryId: number;
  difficulty: Difficulty;
  mode: QuizMode;
  correct: number;
  total: number;
  date: string;
}

interface Progress {
  sessions: SessionResult[];
}

function getInitialProgress(): Progress {
  if (typeof window === 'undefined') return { sessions: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { sessions: [] };
  } catch {
    return { sessions: [] };
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({ sessions: [] });

  useEffect(() => {
    setProgress(getInitialProgress());
  }, []);

  const saveSession = useCallback((result: SessionResult) => {
    setProgress(prev => {
      const updated = { sessions: [...prev.sessions, result] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({ sessions: [] });
  }, []);

  const getStats = useCallback((categoryId: number, mode: QuizMode, difficulty: Difficulty) => {
    const relevant = progress.sessions.filter(
      s => s.categoryId === categoryId && s.mode === mode && s.difficulty === difficulty
    );
    if (relevant.length === 0) return null;
    const totalCorrect = relevant.reduce((sum, s) => sum + s.correct, 0);
    const totalQ = relevant.reduce((sum, s) => sum + s.total, 0);
    return { correct: totalCorrect, total: totalQ, rate: Math.round((totalCorrect / totalQ) * 100) };
  }, [progress]);

  return { progress, saveSession, resetProgress, getStats };
}
