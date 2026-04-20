'use client';
import { useState } from 'react';
import type { Question, JournalAnswer, JournalLine } from '@/types';

const ACCOUNTS = [
  '現金','当座預金','普通預金','小口現金','受取手形','売掛金','電子記録債権',
  '貸付金','手形貸付金','役員貸付金','前払金','前払費用','未収収益','未収入金',
  '繰越商品','商品','消耗品','貯蔵品','差入保証金','仮払金','仮払法人税等',
  '立替金','建物','土地','備品','車両運搬具','建物減価償却累計額','備品減価償却累計額',
  '支払手形','買掛金','電子記録債務','未払金','未払費用','前受金','前受収益',
  '仮受金','預り金','借入金','手形借入金','当座借越','未払法人税等','未払消費税',
  '資本金','資本準備金','利益準備金','繰越利益剰余金','未払配当金',
  '現金過不足','損益',
  '仕入','売上','受取利息','受取家賃','受取地代','固定資産売却益','償却債権取立益',
  '雑益','受取商品券','クレジット売掛金',
  '給料','法定福利費','福利厚生費','旅費交通費','通信費','消耗品費','支払家賃',
  '支払利息','支払手数料','水道光熱費','修繕費','減価償却費','賃借料',
  '貸倒損失','貸倒引当金繰入','雑損','租税公課','交際費','雑費','保険料',
  '固定資産売却損','手形売却損','法人税等','仮受消費税','仮払消費税',
  '貸倒引当金',
];

interface LineInput {
  account: string;
  amount: string;
}

function JournalLineInput({ line, onChange, onRemove, showRemove }: {
  line: LineInput;
  onChange: (l: LineInput) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showSug, setShowSug] = useState(false);

  const handleAccountChange = (v: string) => {
    onChange({ ...line, account: v });
    setFiltered(v ? ACCOUNTS.filter(a => a.includes(v)).slice(0, 6) : []);
    setShowSug(true);
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={line.account}
            onChange={e => handleAccountChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSug(false), 150)}
            placeholder="勘定科目"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
          {showSug && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
              {filtered.map(a => (
                <button
                  key={a}
                  type="button"
                  onMouseDown={() => { onChange({ ...line, account: a }); setShowSug(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          value={line.amount}
          onChange={e => onChange({ ...line, amount: e.target.value })}
          placeholder="金額"
          className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
        />
        {showRemove && (
          <button type="button" onClick={onRemove} className="text-gray-300 text-xl px-1">×</button>
        )}
      </div>
    </div>
  );
}

interface Props {
  question: Question;
  onAnswer: (answer: JournalAnswer) => void;
}

export default function JournalQuestion({ question, onAnswer }: Props) {
  const [debits, setDebits] = useState<LineInput[]>([{ account: '', amount: '' }]);
  const [credits, setCredits] = useState<LineInput[]>([{ account: '', amount: '' }]);

  const updateDebit = (i: number, v: LineInput) => setDebits(d => d.map((x, j) => j === i ? v : x));
  const updateCredit = (i: number, v: LineInput) => setCredits(d => d.map((x, j) => j === i ? v : x));

  const isValid = () => {
    const check = (lines: LineInput[]) => lines.every(l => l.account.trim() && Number(l.amount) > 0);
    return check(debits) && check(credits);
  };

  const handleSubmit = () => {
    if (!isValid()) return;
    const answer: JournalAnswer = {
      debit: debits.map(l => ({ account: l.account.trim(), amount: Number(l.amount) })),
      credit: credits.map(l => ({ account: l.account.trim(), amount: Number(l.amount) })),
    };
    onAnswer(answer);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-blue-700 text-sm">借方（左）</h3>
          <button
            type="button"
            onClick={() => setDebits(d => [...d, { account: '', amount: '' }])}
            className="text-xs text-blue-600 border border-blue-200 rounded-lg px-2 py-1"
          >
            ＋ 行追加
          </button>
        </div>
        <div className="space-y-2">
          {debits.map((line, i) => (
            <JournalLineInput
              key={i}
              line={line}
              onChange={v => updateDebit(i, v)}
              onRemove={() => setDebits(d => d.filter((_, j) => j !== i))}
              showRemove={debits.length > 1}
            />
          ))}
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm">／</div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-orange-600 text-sm">貸方（右）</h3>
          <button
            type="button"
            onClick={() => setCredits(d => [...d, { account: '', amount: '' }])}
            className="text-xs text-orange-600 border border-orange-200 rounded-lg px-2 py-1"
          >
            ＋ 行追加
          </button>
        </div>
        <div className="space-y-2">
          {credits.map((line, i) => (
            <JournalLineInput
              key={i}
              line={line}
              onChange={v => updateCredit(i, v)}
              onRemove={() => setCredits(d => d.filter((_, j) => j !== i))}
              showRemove={credits.length > 1}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid()}
        className="w-full py-4 bg-blue-700 text-white rounded-2xl font-bold text-lg disabled:opacity-40"
      >
        答え合わせ
      </button>
    </div>
  );
}
