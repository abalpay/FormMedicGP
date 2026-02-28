import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SavedFormLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-9 w-28 shimmer" />

      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20 shimmer" />
                <Skeleton className="h-5 w-40 shimmer" />
              </div>
            ))}
          </div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-64 w-full shimmer" />
        </CardContent>
      </Card>
    </div>
  );
}
