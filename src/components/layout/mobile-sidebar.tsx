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
import { Separator } from '@/components/ui/separator';
import { NavItem } from '@/components/layout/nav-item';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { href: '/forms/new', label: 'New Form', icon: 'file-plus' as const },
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
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
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-6 h-16 flex flex-row items-center gap-3 border-b border-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <SheetTitle>
            <Link href="/" onClick={() => setOpen(false)} className="font-semibold text-lg">
              FormMedic
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="px-3 py-4 space-y-1" onClick={() => setOpen(false)}>
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>
        <Separator />
      </SheetContent>
    </Sheet>
  );
}
