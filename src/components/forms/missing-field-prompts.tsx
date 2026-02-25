'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Send } from 'lucide-react';

interface MissingFieldPromptsProps {
  missingFields: string[];
  onSubmit: (answers: Record<string, string>) => void;
}

export function MissingFieldPrompts({
  missingFields,
  onSubmit,
}: MissingFieldPromptsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (missingFields.length === 0) return null;

  return (
    <Card className="border-warning/30 bg-gradient-to-br from-warning/5 to-transparent shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2.5 font-[family-name:var(--font-display)]">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          Additional Information Needed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          The following fields couldn&apos;t be determined from your dictation. Please
          provide the missing information.
        </p>
        {missingFields.map((field) => (
          <div key={field} className="space-y-1.5">
            <Label className="text-sm">{field}</Label>
            <Input
              placeholder={`Enter ${field.toLowerCase()}`}
              value={answers[field] ?? ''}
              className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [field]: e.target.value }))
              }
            />
          </div>
        ))}
        <Button
          size="sm"
          onClick={() => onSubmit(answers)}
          disabled={missingFields.some((f) => !answers[f]?.trim())}
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Update Form
        </Button>
      </CardContent>
    </Card>
  );
}
