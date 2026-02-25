'use client';

import { FileText, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormOption {
  id: string;
  name: string;
  description: string;
}

const availableForms: FormOption[] = [
  {
    id: 'SU415',
    name: 'Centrelink Medical Certificate (SU415)',
    description:
      'For patients requiring temporary incapacity exemption from mutual obligations. Covers work capacity, condition duration, and functional impact.',
  },
];

interface FormSelectorProps {
  selectedFormId: string | null;
  onSelect: (formId: string) => void;
}

export function FormSelector({ selectedFormId, onSelect }: FormSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">Select a form</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose the government form you need to complete.
        </p>
      </div>
      <div className="grid gap-3">
        {availableForms.map((form) => {
          const isSelected = selectedFormId === form.id;
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onSelect(form.id)}
              className="text-left w-full"
            >
              <Card
                className={cn(
                  'transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/30 hover:shadow-sm'
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {form.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
