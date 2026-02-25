import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 shimmer" />
        <Skeleton className="h-4 w-96 shimmer" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-12 w-12 rounded-xl shimmer" />
            <Skeleton className="h-5 w-32 shimmer" />
            <Skeleton className="h-4 w-48 shimmer" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-12 w-12 rounded-xl shimmer" />
            <Skeleton className="h-5 w-32 shimmer" />
            <Skeleton className="h-4 w-48 shimmer" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 shimmer" />
        <Card className="shadow-sm">
          <CardContent className="py-12">
            <Skeleton className="h-24 w-full shimmer" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
