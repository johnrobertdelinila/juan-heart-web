'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  BarChart3,
  Settings,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Hospital,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigationItems = [
  {
    name: 'National Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Clinical Dashboard',
    href: '/clinical',
    icon: Stethoscope,
  },
  {
    name: 'Facility Dashboard',
    href: '/facilities/1',
    icon: Hospital,
  },
  {
    name: 'Assessments',
    href: '/assessments',
    icon: FileText,
  },
  {
    name: 'Referrals',
    href: '/referrals',
    icon: Building2,
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 z-40 hidden h-screen w-72 border-r border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-white px-6">
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="bg-gradient-primary relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all group-hover:shadow-2xl">
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative text-lg font-bold tracking-tight text-white">JH</span>
              </div>
              <div>
                <span className="block text-xl font-bold tracking-tight text-slate-900">
                  Juan Heart
                </span>
                <span className="block text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                  Clinical Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative z-10 flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'from-heart-red via-heart-red to-heart-red-dark shadow-heart-red/30 !important bg-gradient-to-r text-white shadow-xl'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 hover:shadow-md active:scale-[0.98]'
                  }`}
                  style={
                    isActive
                      ? { background: 'linear-gradient(to right, #DC2626, #DC2626, #B91C1C)' }
                      : undefined
                  }
                >
                  {/* Active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 animate-pulse rounded-xl bg-white/10" />
                      <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                    </>
                  )}

                  <Icon
                    className={`relative z-20 h-5 w-5 transition-all duration-200 ${
                      isActive
                        ? 'scale-110 text-white'
                        : 'group-hover:text-heart-red text-slate-500 group-hover:scale-110 group-hover:rotate-3'
                    }`}
                  />
                  <span
                    className={`relative z-20 flex-1 tracking-tight ${isActive ? 'font-bold' : ''}`}
                  >
                    {item.name}
                  </span>

                  {/* Hover arrow */}
                  {!isActive && (
                    <ChevronRight className="relative z-20 h-4 w-4 text-slate-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  )}
                  {isActive && (
                    <div className="relative z-20 h-2 w-2 rounded-full bg-white shadow-md" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-4">
            <Link
              href="/settings"
              className="group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-slate-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 hover:shadow-md active:scale-[0.98]"
            >
              <Settings className="group-hover:text-heart-red h-5 w-5 text-slate-500 transition-all group-hover:scale-110 group-hover:rotate-90" />
              <span className="flex-1 tracking-tight">Settings</span>
              <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="shadow-clinical-lg fixed top-0 left-0 h-full w-72 border-r border-slate-200/60 bg-white">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-20 items-center justify-between border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-white px-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="bg-gradient-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg">
                    <span className="text-lg font-bold tracking-tight text-white">JH</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold tracking-tight text-slate-900">
                      Juan Heart
                    </span>
                    <span className="block text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                      Clinical Platform
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative z-10 flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[13px] font-semibold transition-all duration-200 ${
                        isActive
                          ? 'from-heart-red via-heart-red to-heart-red-dark shadow-heart-red/30 !important bg-gradient-to-r text-white shadow-xl'
                          : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 hover:shadow-md'
                      }`}
                      style={
                        isActive
                          ? { background: 'linear-gradient(to right, #DC2626, #DC2626, #B91C1C)' }
                          : undefined
                      }
                    >
                      {isActive && (
                        <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                      )}
                      <Icon
                        className={`relative z-20 h-5 w-5 transition-all ${
                          isActive
                            ? 'scale-110 text-white'
                            : 'group-hover:text-heart-red text-slate-500 group-hover:scale-110'
                        }`}
                      />
                      <span
                        className={`relative z-20 flex-1 tracking-tight ${isActive ? 'font-bold' : ''}`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="border-t border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-4">
                <Link
                  href="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="group flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-slate-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 hover:shadow-md"
                >
                  <Settings className="group-hover:text-heart-red h-5 w-5 text-slate-500 transition-all group-hover:scale-110 group-hover:rotate-90" />
                  <span className="flex-1 tracking-tight">Settings</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 shadow-sm backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-slate-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold tracking-tight text-slate-900">
                  Clinical Management Platform
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">Philippine Heart Center</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative transition-colors hover:bg-slate-100"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="bg-heart-red absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full shadow-sm" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 transition-colors hover:bg-slate-100"
                  >
                    <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                      Dr. Juan Dela Cruz
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-clinical-md w-56">
                  <DropdownMenuLabel className="text-slate-700">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer transition-colors">
                      <User className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="text-sm">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer transition-colors">
                      <Settings className="mr-2 h-4 w-4 text-slate-500" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-heart-red focus:text-heart-red cursor-pointer transition-colors">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1800px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
