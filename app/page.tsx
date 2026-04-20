'use client';
import { useState } from 'react';
import type { QuizMode, Difficulty } from '@/types';
import { useProgress } from '@/hooks/useProgress';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 1, name: '財務諸表の基本', emoji: '📊' },
  { id: 2, name: '現金・預金', emoji: '💴' },
  { id: 3, name: '商品売買', emoji: '🛒' },
  { id: 4, name: '手形・債権債務', emoji: '📝' },
  { id: 5, name: '固定資産', emoji: '🏢' },
  { id: 6, name: '給料・その他取引', emoji: '💼' },
  { id: 7, name: '帳簿・伝票', emoji: '📚' },
  { id: 8, name: '決算Ⅰ', emoji: '📅' },
  { id: 9, name: '決算Ⅱ', emoji: '🔖' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'low', label: '初級', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'medium', label: '中級', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'high', label: '上級', color: 'bg-red-100 text-red-800 border-red-300' },
];

type Step = 'mode' | 'category' | 'difficulty';

export default function HomePage() {
  const router = useRouter();
  const { progress, resetProgress, getStats } = useProgress();
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [showReset, setShowReset] = useState(false);

  const selectMode = (m: QuizMode) => { setMode(m); setStep('category'); };
  const selectCategory = (id: number) => { setCategoryId(id); setStep('difficulty'); };
  const selectDifficulty = (d: Difficulty) => {
    router.push(`/quiz?mode=${mode}&categoryId=${categoryId}&difficulty=${d}`);
  };

  const totalSessions = progress.sessions.length;
  const totalCorrect = progress.sessions.reduce((s, x) => s + x.correct, 0);
  const totalQ = progress.sessions.reduce((s, x) => s + x.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col">
      <div className="px-5 pt-12 pb-6 text-white">
        <h1 className="text-2xl font-bold">簿記3級 練習アプリ</h1>
        <p className="text-blue-200 text-sm mt-1">スキマ時間で合格を目指そう</p>
        {totalSessions > 0 && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 flex gap-4 text-sm">
            <span>実施 <strong>{totalSessions}</strong> 回</span>
            <span>正答率 <strong>{totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0}%</strong></span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50 rounded-t-3xl px-5 pt-6 pb-8">
        {step === 'mode' && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-4">問題モードを選択</h2>
            <div className="space-y-3">
              <button
                onClick={() => selectMode('choice')}
                className="w-full bg-white rounded-2xl p-5 text-left shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                <div className="text-3xl mb-2">📝</div>
                <div className="font-bold text-gray-800 text-lg">選択式</div>
                <div className="text-gray-500 text-sm mt-1">4択から正しい答えを選ぼう</div>
              </button>
              <button
                onClick={() => selectMode('journal')}
                className="w-full bg-white rounded-2xl p-5 text-left shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                <div className="text-3xl mb-2">✏️</div>
                <div className="font-bold text-gray-800 text-lg">仕訳式</div>
                <div className="text-gray-500 text-sm mt-1">借方・貸方の勘定科目と金額を入力しよう</div>
              </button>
            </div>
            <div className="mt-8">
              <button
                onClick={() => router.push('/results')}
                className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium mb-3"
              >
                📈 成績を確認する
              </button>
              <button
                onClick={() => setShowReset(true)}
                className="w-full py-3 rounded-2xl border border-red-200 text-red-500 text-sm"
              >
                🗑️ 学習履歴をリセット
              </button>
            </div>
          </>
        )}

        {step === 'category' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep('mode')} className="text-blue-600 text-sm">← 戻る</button>
              <h2 className="text-lg font-bold text-gray-800">
                {mode === 'choice' ? '📝 選択式' : '✏️ 仕訳式'} ｜ カテゴリを選択
              </h2>
            </div>
            <div className="space-y-2">
              {CATEGORIES.map(cat => {
                const low = getStats(cat.id, mode!, 'low');
                const med = getStats(cat.id, mode!, 'medium');
                const high = getStats(cat.id, mode!, 'high');
                const hasData = low || med || high;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className="w-full bg-white rounded-2xl px-4 py-3 text-left shadow-sm border border-gray-100 active:scale-95 transition-transform flex items-center gap-3"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm">{cat.name}</div>
                      {hasData && (
                        <div className="flex gap-2 mt-0.5">
                          {low && <span className="text-xs text-green-600">初{low.rate}%</span>}
                          {med && <span className="text-xs text-yellow-600">中{med.rate}%</span>}
                          {high && <span className="text-xs text-red-600">上{high.rate}%</span>}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-300">›</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 'difficulty' && categoryId && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep('category')} className="text-blue-600 text-sm">← 戻る</button>
              <h2 className="text-lg font-bold text-gray-800">難易度を選択</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              {CATEGORIES.find(c => c.id === categoryId)?.name}
            </p>
            <div className="space-y-3">
              {DIFFICULTIES.map(d => {
                const stats = getStats(categoryId, mode!, d.value);
                return (
                  <button
                    key={d.value}
                    onClick={() => selectDifficulty(d.value)}
                    className={`w-full rounded-2xl px-5 py-4 text-left border-2 active:scale-95 transition-transform ${d.color}`}
                  >
                    <div className="font-bold text-base">{d.label}</div>
                    <div className="text-sm mt-0.5 opacity-70">各10問</div>
                    {stats && (
                      <div className="text-sm font-semibold mt-1">正答率 {stats.rate}% ({stats.correct}/{stats.total})</div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 text-lg mb-2">学習履歴をリセット</h3>
            <p className="text-gray-500 text-sm mb-5">すべての成績データが削除されます。この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600">キャンセル</button>
              <button
                onClick={() => { resetProgress(); setShowReset(false); }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold"
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
