'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full shadow-lg animate-fade-in-up">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground font-[family-name:var(--font-display)]">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              An unexpected error occurred. Please try again.
            </p>
          </div>
          <Button onClick={reset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
