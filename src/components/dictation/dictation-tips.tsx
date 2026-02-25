import { Lightbulb } from 'lucide-react';

const defaultTips = [
  'What is the diagnosis and how does it affect daily activities?',
  'What treatment has been tried, and what is the current plan?',
  'When did the condition start and when can they return to work?',
];

interface DictationTipsProps {
  tips?: string[];
  formName?: string;
}

export function DictationTips({ tips = defaultTips, formName }: DictationTipsProps) {
  const heading = formName
    ? `What to cover — ${formName}`
    : 'What to cover';

  return (
    <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-amber-50/30 shadow-sm pl-4 pr-4 py-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100">
          <Lightbulb className="w-4 h-4 text-amber-600" />
        </div>
        <span className="text-sm font-semibold text-amber-900">
          {heading}
        </span>
      </div>
      <ul className="space-y-2 pl-9.5">
        {tips.map((tip) => (
          <li
            key={tip}
            className="text-xs text-amber-800 flex items-start gap-2"
          >
            <span className="mt-1.5 block w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
