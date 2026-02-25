import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center text-center space-y-4 p-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <FileQuestion className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
