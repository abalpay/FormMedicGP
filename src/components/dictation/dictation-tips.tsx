import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const defaultTips = [
  'Mention the diagnosis and functional impact on daily activities.',
  'Include treatment history and the current management plan.',
  'Add specific dates when condition onset or incapacity windows are known.',
];

interface DictationTipsProps {
  tips?: string[];
}

export function DictationTips({ tips = defaultTips }: DictationTipsProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">
            Tips for better results
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
      </CardContent>
    </Card>
  );
}
