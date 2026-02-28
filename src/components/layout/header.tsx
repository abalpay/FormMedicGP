'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/forms/new': 'New Form',
  '/dashboard/dictate': 'Describe',
  '/dashboard/settings': 'Settings',
};

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'Dr';
}

export function Header({ userName, userEmail }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getTitle = () => {
    if (pathname.startsWith('/dashboard/forms/') && pathname !== '/dashboard/forms/new') {
      return 'Form Review';
    }
    if (pathname.startsWith('/dashboard/saved/')) {
      return 'Saved Form';
    }
    return pageTitles[pathname] ?? 'FormMedic';
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
      return;
    }
    router.push('/');
    router.refresh();
  };

  const initials = getInitials(userName, userEmail);
  const displayName = userName || userEmail || 'Doctor';

  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-8 border-b border-border bg-card/80 glass sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <h1 className="text-xl font-semibold text-foreground font-[family-name:var(--font-display)]">
          {getTitle()}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9 transition-shadow hover:ring-2 hover:ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium truncate">{displayName}</p>
            {userEmail && userName && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {userEmail}
              </p>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/dashboard/settings" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-2 text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
