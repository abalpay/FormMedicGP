'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FilePlus, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'file-plus': FilePlus,
  settings: Settings,
};

interface NavItemProps {
  href: string;
  label: string;
  icon: string;
}

export function NavItem({ href, label, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
  const Icon = iconMap[icon] ?? LayoutDashboard;

  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/60 hover:bg-white/8 hover:text-white/90'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
      )}
      <Icon className="w-4.5 h-4.5" />
      {label}
    </Link>
  );
}
