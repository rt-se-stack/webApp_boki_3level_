'use client';
import type { Question } from '@/types';

interface Props {
  question: Question;
  onAnswer: (answer: string) => void;
}

export default function ChoiceQuestion({ question, onAnswer }: Props) {
  return (
    <div className="space-y-2">
      {question.options?.map((opt, i) => (
        <button
          key={i}
          onClick={() => onAnswer(opt)}
          className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-4 text-left text-gray-800 text-sm font-medium active:scale-95 transition-transform leading-relaxed"
        >
          <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold text-center leading-6 mr-2 flex-shrink-0">
            {['A', 'B', 'C', 'D'][i]}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}
