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
    <div className="border-l-2 border-l-amber-400 bg-amber-50/30 rounded-md pl-4 pr-3 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-900">
          {heading}
        </span>
      </div>
      <ul className="space-y-1.5">
        {tips.map((tip) => (
          <li
            key={tip}
            className="text-xs text-amber-800 flex items-start gap-2"
          >
            <span className="mt-1 block w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
