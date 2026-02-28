import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32 shimmer" />
        <Skeleton className="h-4 w-64 shimmer" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-48 shimmer" />
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28 shimmer" />
                <Skeleton className="h-10 w-full shimmer" />
              </div>
            ))}
            <Skeleton className="h-10 w-24 shimmer" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
