'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavItem } from '@/components/layout/nav-item';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { href: '/dashboard/forms/new', label: 'New Form', icon: 'file-plus' as const },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' as const },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <TooltipProvider>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="hidden lg:flex lg:flex-col gradient-sidebar h-screen sticky top-0 transition-[width] duration-300 ease-in-out overflow-hidden"
        style={{ width: expanded ? 220 : 72 }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 shadow-[0_0_20px_oklch(0.6_0.1_175/0.3)] shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <Link
            href="/dashboard"
            className="font-semibold text-lg text-white font-[family-name:var(--font-display)] whitespace-nowrap transition-opacity duration-300"
            style={{ opacity: expanded ? 1 : 0 }}
            tabIndex={expanded ? 0 : -1}
          >
            FormBridge GP
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              expanded={expanded}
            />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
