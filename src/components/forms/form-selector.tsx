'use client';

import { useEffect, useState } from 'react';
import { FileText, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FormCatalogItem } from '@/types';

type FormOption = FormCatalogItem;

interface FormSelectorProps {
  selectedFormId: string | null;
  onSelect: (formId: string) => void;
}

export function FormSelector({ selectedFormId, onSelect }: FormSelectorProps) {
  const [availableForms, setAvailableForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadForms() {
      try {
        const res = await fetch('/api/forms', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load forms (${res.status})`);
        }
        const body = (await res.json()) as { forms?: FormOption[] };
        if (!cancelled) {
          setAvailableForms(body.forms ?? []);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load forms';
          setLoadError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadForms();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">Select a form</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose the government form you need to complete.
        </p>
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground">Loading available forms...</p>
      )}
      {loadError && (
        <p className="text-xs text-destructive">
          Could not load forms: {loadError}
        </p>
      )}
      <div className="grid gap-3">
        {availableForms.map((form, index) => {
          const isSelected = selectedFormId === form.id;
          return (
            <button
              key={form.id}
              type="button"
              onClick={() => onSelect(form.id)}
              disabled={form.deferred}
              className="text-left w-full animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card
                className={cn(
                  'transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md -translate-y-0.5 border-l-4 border-l-primary'
                    : 'hover:border-primary/30 hover:shadow-sm hover:-translate-y-px'
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-all duration-200',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.47_0.1_175/0.3)]'
                        : 'bg-gradient-to-br from-primary/10 to-primary/5 text-primary'
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
                      {form.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Version {form.version}
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
