'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  FileText,
  Building2,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
}

export interface SidebarProps {
  /**
   * Navigation items to display
   */
  items?: NavItem[];
  /**
   * Whether the sidebar is collapsed
   */
  collapsed?: boolean;
  /**
   * Callback when collapse state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Whether the sidebar can be collapsed
   */
  collapsible?: boolean;
}

const defaultNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Assessments',
    href: '/assessments',
    icon: Heart,
    badge: 12,
  },
  {
    title: 'Referrals',
    href: '/referrals',
    icon: FileText,
    badge: 5,
  },
  {
    title: 'Facilities',
    href: '/facilities',
    icon: Building2,
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
  },
];

export function Sidebar({
  items = defaultNavItems,
  collapsed = false,
  onCollapsedChange,
  collapsible = true,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-background fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation items */}
        <nav className="flex-1 space-y-1 p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  item.disabled && 'pointer-events-none opacity-50',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-medium">
                        {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle button */}
        {collapsible && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => onCollapsedChange?.(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="size-5" />
              ) : (
                <>
                  <ChevronLeft className="size-5" />
                  <span className="ml-2 text-sm">Collapse</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
