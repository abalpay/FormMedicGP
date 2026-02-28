'use client';

import { usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/forms/new': 'New Form',
  '/dashboard/dictate': 'Describe',
  '/dashboard/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/dashboard/forms/') && pathname !== '/dashboard/forms/new') {
      return 'Form Review';
    }
    return pageTitles[pathname] ?? 'FormMedic';
  };

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
                Dr
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <a href="/dashboard/settings" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 text-destructive">
            <LogOut className="w-4 h-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
