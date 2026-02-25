'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.label} className="flex items-center gap-2">
            {index > 0 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-12 rounded-full transition-all duration-500',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground shadow-[0_0_0_4px_oklch(0.47_0.1_175/0.15)]',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-sm hidden sm:inline transition-colors',
                  isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
