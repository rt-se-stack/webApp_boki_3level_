'use client';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/hooks/useProgress';

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

const DIFFICULTIES = [
  { value: 'low' as const, label: '初', color: 'text-green-600' },
  { value: 'medium' as const, label: '中', color: 'text-yellow-600' },
  { value: 'high' as const, label: '上', color: 'text-red-600' },
];

export default function ResultsPage() {
  const router = useRouter();
  const { progress, getStats } = useProgress();

  const totalSessions = progress.sessions.length;
  const totalCorrect = progress.sessions.reduce((s, x) => s + x.correct, 0);
  const totalQ = progress.sessions.reduce((s, x) => s + x.total, 0);
  const overallRate = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col">
      <div className="px-5 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-blue-200">← 戻る</button>
          <h1 className="text-xl font-bold">成績確認</h1>
        </div>
        {totalSessions > 0 && (
          <div className="mt-4 bg-white/20 rounded-2xl p-4 text-center">
            <div className="text-4xl font-bold">{overallRate}%</div>
            <div className="text-blue-200 text-sm mt-1">総合正答率 （{totalCorrect}/{totalQ} 問）</div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50 rounded-t-3xl px-5 pt-6 pb-8">
        {totalSessions === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-3">📊</div>
            <p>まだ成績がありません</p>
            <button onClick={() => router.push('/')} className="mt-4 text-blue-600 font-medium">問題を解く →</button>
          </div>
        ) : (
          <>
            <h2 className="font-bold text-gray-700 mb-3">カテゴリ別成績</h2>
            <div className="space-y-3">
              {CATEGORIES.map(cat => {
                const hasAny = ['choice', 'journal'].some(m =>
                  DIFFICULTIES.some(d => getStats(cat.id, m as 'choice' | 'journal', d.value))
                );
                if (!hasAny) return null;
                return (
                  <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="font-medium text-gray-800 text-sm">{cat.name}</span>
                    </div>
                    {(['choice', 'journal'] as const).map(m => (
                      <div key={m} className="mb-2">
                        <div className="text-xs text-gray-400 mb-1">{m === 'choice' ? '📝 選択式' : '✏️ 仕訳式'}</div>
                        <div className="flex gap-2">
                          {DIFFICULTIES.map(d => {
                            const stats = getStats(cat.id, m, d.value);
                            if (!stats) return <div key={d.value} className="flex-1 h-8 bg-gray-50 rounded-lg" />;
                            return (
                              <div key={d.value} className="flex-1 bg-gray-50 rounded-lg px-2 py-1 text-center">
                                <div className={`text-xs font-bold ${d.color}`}>{d.label}</div>
                                <div className="text-xs text-gray-600">{stats.rate}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <h2 className="font-bold text-gray-700 mt-6 mb-3">最近の記録</h2>
            <div className="space-y-2">
              {[...progress.sessions].reverse().slice(0, 10).map((s, i) => {
                const cat = CATEGORIES.find(c => c.id === s.categoryId);
                const rate = Math.round((s.correct / s.total) * 100);
                const d = new Date(s.date);
                return (
                  <div key={i} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{cat?.emoji} {cat?.name}</div>
                      <div className="text-xs text-gray-400">
                        {s.mode === 'choice' ? '選択式' : '仕訳式'} ·
                        {s.difficulty === 'low' ? ' 初級' : s.difficulty === 'medium' ? ' 中級' : ' 上級'} ·
                        {d.getMonth() + 1}/{d.getDate()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {rate}%
                      </div>
                      <div className="text-xs text-gray-400">{s.correct}/{s.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
