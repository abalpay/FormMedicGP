import Link from 'next/link';
import { FilePlus, FileText, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Welcome back, Doctor
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete government forms in under 2 minutes with AI-powered dictation.
        </p>
      </div>

      {/* Profile setup banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Set up your profile to get started
              </p>
              <p className="text-xs text-muted-foreground">
                Your provider details will auto-fill on every form.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              Set up
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/forms/new" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <FilePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">New Form</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a form, enter patient details, and dictate.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Forms Today</h3>
                <Badge variant="secondary" className="text-xs">
                  0
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                No forms completed today.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent forms — empty state */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recent Forms
        </h3>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              No forms yet. Create your first form to get started.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/forms/new">
                <FilePlus className="w-4 h-4 mr-1.5" />
                New Form
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
