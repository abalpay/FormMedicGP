'use client';

import { FileText, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FormCatalogItem } from '@/types';

interface FormSelectorProps {
  selectedFormId: string | null;
  onSelect: (formId: string, label: string) => void;
  forms: FormCatalogItem[];
}

export function FormSelector({ selectedFormId, onSelect, forms }: FormSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">Select a form</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose the government form you need to complete.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {forms.map((form, index) => {
          const isSelected = selectedFormId === form.id;
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onSelect(form.id, form.label)}
              disabled={form.deferred}
              className="text-left w-full animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card
                className={cn(
                  'h-full transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md border-l-4 border-l-primary'
                    : 'hover:border-primary/30 hover:shadow-sm'
                )}
              >
                <CardContent className="flex flex-col gap-2 p-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 transition-all duration-200',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {form.label}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {form.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {form.id} &middot; v{form.version}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
