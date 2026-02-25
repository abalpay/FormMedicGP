import Link from 'next/link';
import { FileText, Stethoscope } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { NavItem } from '@/components/layout/nav-item';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { href: '/forms/new', label: 'New Form', icon: 'file-plus' as const },
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:border-r lg:border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Stethoscope className="w-5 h-5 text-primary-foreground" />
        </div>
        <Link href="/" className="font-semibold text-lg text-foreground">
          FormMedic
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="w-3.5 h-3.5" />
          <span>FormMedic v1.0</span>
        </div>
      </div>
    </aside>
  );
}
