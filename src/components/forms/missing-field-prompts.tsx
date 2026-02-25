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
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
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
