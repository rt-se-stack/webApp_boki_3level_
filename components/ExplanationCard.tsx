'use client';
import type { Question } from '@/types';

interface Props {
  question: Question;
  isCorrect: boolean;
  onNext: () => void;
  isLast: boolean;
}

export default function ExplanationCard({ question, isCorrect, onNext, isLast }: Props) {
  return (
    <div className="space-y-4">
      {/* Result badge */}
      <div className={`rounded-2xl p-4 text-center ${isCorrect ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'}`}>
        <div className="text-3xl mb-1">{isCorrect ? '⭕️' : '❌'}</div>
        <div className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
          {isCorrect ? '正解！' : '不正解'}
        </div>
      </div>

      {/* Correct answer */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-700 text-sm mb-2">✅ 正解</h3>
        {question.type === 'choice' ? (
          <p className="text-gray-800 text-sm font-medium">{question.answer}</p>
        ) : (
          <div className="text-sm space-y-1">
            <div>
              <span className="text-blue-700 font-bold">借方：</span>
              {question.journalAnswer?.debit.map((l, i) => (
                <span key={i} className="ml-1">{l.account} {l.amount.toLocaleString()}円{i < (question.journalAnswer?.debit.length ?? 1) - 1 ? '　' : ''}</span>
              ))}
            </div>
            <div>
              <span className="text-orange-600 font-bold">貸方：</span>
              {question.journalAnswer?.credit.map((l, i) => (
                <span key={i} className="ml-1">{l.account} {l.amount.toLocaleString()}円{i < (question.journalAnswer?.credit.length ?? 1) - 1 ? '　' : ''}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 rounded-2xl p-4">
        <h3 className="font-bold text-blue-800 text-sm mb-2">📖 解説</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{question.explanation}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-blue-700 text-white rounded-2xl font-bold text-lg"
      >
        {isLast ? '結果を見る' : '次の問題へ →'}
      </button>
    </div>
  );
}
