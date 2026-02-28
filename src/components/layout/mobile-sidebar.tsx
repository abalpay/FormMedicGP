'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NavItem } from '@/components/layout/nav-item';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { href: '/dashboard/forms/new', label: 'New Form', icon: 'file-plus' as const },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' as const },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[220px] p-0 gradient-sidebar border-r-0">
        <SheetHeader className="px-6 h-16 flex flex-row items-center gap-3 border-b border-white/10">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 shadow-[0_0_20px_oklch(0.6_0.1_175/0.3)]">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <SheetTitle>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="font-semibold text-lg text-white font-[family-name:var(--font-display)]">
              FormMedic
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="px-3 py-4 space-y-1" onClick={() => setOpen(false)}>
          {navItems.map((item, index) => (
            <div
              key={item.href}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NavItem href={item.href} label={item.label} icon={item.icon} />
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
