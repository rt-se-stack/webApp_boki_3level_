'use client';
import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { QuizMode, Difficulty, JournalAnswer } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';
import { useProgress } from '@/hooks/useProgress';
import ChoiceQuestion from '@/components/ChoiceQuestion';
import JournalQuestion from '@/components/JournalQuestion';
import ExplanationCard from '@/components/ExplanationCard';

export default function QuizClient() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = (params.get('mode') || 'choice') as QuizMode;
  const categoryId = parseInt(params.get('categoryId') || '1');
  const difficulty = (params.get('difficulty') || 'low') as Difficulty;

  const { current, index, total, results, finished, score, submitAnswer, next } = useQuiz(categoryId, difficulty, mode);
  const { saveSession } = useProgress();

  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  const handleAnswer = useCallback((answer: string | JournalAnswer) => {
    const correct = submitAnswer(answer);
    setLastCorrect(correct);
    setAnswered(true);
  }, [submitAnswer]);

  const handleNext = useCallback(() => {
    setAnswered(false);
    next();
  }, [next]);

  if (finished && !sessionSaved) {
    saveSession({ categoryId, difficulty, mode, correct: score, total: results.length, date: new Date().toISOString() });
    setSessionSaved(true);
  }

  if (finished) {
    const rate = Math.round((score / results.length) * 100);

    const praise = (() => {
      const msgs = rate === 100
        ? ['🏆 完璧！満点です！天才！', '🌟 パーフェクト！全問正解！', '👑 完璧すぎる！簿記マスター！']
        : rate >= 80
        ? ['🎉 素晴らしい！この調子！', '✨ すごい！かなり実力ついてきた！', '🎊 よくできました！もう合格レベル！']
        : rate >= 60
        ? ['😊 いい感じ！あと少しで合格圏！', '👍 惜しい！もう一息！', '💪 なかなかやるね！次はもっといける！']
        : rate >= 40
        ? ['📖 ここが伸びしろ！一緒に頑張ろう！', '🔥 諦めないで！繰り返せば必ず上がる！', '💡 間違えた問題が一番の教材！']
        : ['🌱 まだまだこれから！焦らず復習しよう', '📚 一歩一歩！今日より明日が絶対伸びる！', '🤗 チャレンジした君を褒めたい！'];
      return msgs[Math.floor(Math.random() * msgs.length)];
    })();

    const radius = 54;
    const circ = 2 * Math.PI * radius;
    const dash = (rate / 100) * circ;
    const ringColor = rate >= 80 ? '#22c55e' : rate >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col">
        <div className="px-5 pt-12 pb-6 text-white">
          <h1 className="text-xl font-bold">セッション完了！</h1>
        </div>
        <div className="flex-1 bg-gray-50 rounded-t-3xl px-5 pt-8 pb-8 flex flex-col items-center">

          {/* 褒めメッセージ */}
          <div className="w-full bg-white rounded-2xl px-5 py-4 mb-6 text-center shadow-sm border border-gray-100">
            <p className="text-lg font-bold text-gray-800 leading-snug">{praise}</p>
          </div>

          {/* ドーナツグラフ */}
          <div className="relative mb-4">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
              <circle
                cx="70" cy="70" r={radius} fill="none"
                stroke={ringColor} strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={0}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{rate}%</span>
              <span className="text-xs text-gray-400">{score}/{results.length}問</span>
            </div>
          </div>

          {/* 問題ごとの○× */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 px-2">
            {results.map((r, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${r ? 'bg-green-500' : 'bg-red-400'}`}>
                {r ? '○' : '×'}
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-4 bg-blue-700 text-white rounded-2xl font-bold text-lg mb-3"
          >
            ホームに戻る
          </button>
          <button
            onClick={() => router.push(`/quiz?mode=${mode}&categoryId=${categoryId}&difficulty=${difficulty}`)}
            className="w-full py-4 border-2 border-blue-700 text-blue-700 rounded-2xl font-bold text-lg"
          >
            もう一度挑戦
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        問題が見つかりません。ホームに戻ってください。
        <button onClick={() => router.push('/')} className="ml-2 text-blue-600 underline">戻る</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="bg-white px-5 pt-10 pb-4 shadow-sm">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>問題 {index + 1} / {total}</span>
          <button onClick={() => router.push('/')} className="text-gray-400">✕ 終了</button>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all"
            style={{ width: `${((index) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-gray-800 font-medium leading-relaxed">{current.question}</p>
        </div>

        {!answered ? (
          mode === 'choice' ? (
            <ChoiceQuestion question={current} onAnswer={handleAnswer} />
          ) : (
            <JournalQuestion question={current} onAnswer={handleAnswer} />
          )
        ) : (
          <ExplanationCard
            question={current}
            isCorrect={lastCorrect}
            onNext={handleNext}
            isLast={index + 1 >= total}
          />
        )}
      </div>
    </div>
  );
}
