'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FilePlus, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'file-plus': FilePlus,
  settings: Settings,
};

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  expanded?: boolean;
}

export function NavItem({ href, label, icon, expanded = true }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  const Icon = iconMap[icon] ?? LayoutDashboard;

  const link = (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'relative flex items-center h-10 rounded-lg text-sm font-medium transition-all duration-200',
        expanded ? 'gap-3 px-3' : 'justify-center px-0',
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/60 hover:bg-white/8 hover:text-white/90'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
      )}
      <Icon className="w-5 h-5 shrink-0" />
      {expanded && (
        <span className="whitespace-nowrap transition-opacity duration-300 opacity-100">
          {label}
        </span>
      )}
    </Link>
  );

  if (!expanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
