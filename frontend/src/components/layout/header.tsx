'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Menu, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface HeaderProps {
  /**
   * Title to display in the header
   */
  title?: string;
  /**
   * Whether to show the search bar
   */
  showSearch?: boolean;
  /**
   * Whether to show notifications bell
   */
  showNotifications?: boolean;
  /**
   * Number of unread notifications
   */
  notificationCount?: number;
  /**
   * User information
   */
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  /**
   * Callback when menu button is clicked (mobile)
   */
  onMenuClick?: () => void;
  /**
   * Callback when search is performed
   */
  onSearch?: (query: string) => void;
  /**
   * Callback when logout is clicked
   */
  onLogout?: () => void;
}

export function Header({
  title = 'Juan Heart',
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
  user,
  onMenuClick,
  onSearch,
  onLogout,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* Logo and title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
              </svg>
            </div>
            <span className="hidden text-lg font-semibold md:inline-block">{title}</span>
          </Link>
        </div>

        {/* Search bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="hidden flex-1 md:flex md:max-w-md">
            <div className="relative w-full">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input
                type="search"
                placeholder="Search patients, assessments..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          {showNotifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-5" />
                  {notificationCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationCount === 0 ? (
                  <div className="text-muted-foreground p-4 text-center text-sm">
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <DropdownMenuItem>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">New high-risk assessment</p>
                        <p className="text-muted-foreground text-xs">
                          Patient J.D. requires immediate attention
                        </p>
                        <p className="text-muted-foreground text-xs">5 minutes ago</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">Referral accepted</p>
                        <p className="text-muted-foreground text-xs">
                          Philippine Heart Center accepted your referral
                        </p>
                        <p className="text-muted-foreground text-xs">1 hour ago</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                  <div className="hidden flex-col items-start text-left md:flex">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-muted-foreground text-xs">{user.role}</span>
                  </div>
                  <ChevronDown className="text-muted-foreground size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
