'use client';
import { Suspense } from 'react';
import QuizClient from './QuizClient';

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <QuizClient />
    </Suspense>
  );
}
