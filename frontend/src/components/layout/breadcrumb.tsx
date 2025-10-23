'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  /**
   * Display label for the breadcrumb
   */
  label: string;
  /**
   * Link href - if not provided, item is not clickable
   */
  href?: string;
  /**
   * Icon to display before the label
   */
  icon?: React.ElementType;
}

export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[];
  /**
   * Whether to show the home icon for the first item
   */
  showHomeIcon?: boolean;
  /**
   * Custom separator between items
   */
  separator?: React.ReactNode;
  /**
   * Additional className for the breadcrumb container
   */
  className?: string;
}

export function Breadcrumb({
  items,
  showHomeIcon = true,
  separator = <ChevronRight className="text-muted-foreground size-4" />,
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1', className)}>
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center space-x-1">
              {index > 0 && <span className="mx-1">{separator}</span>}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
                >
                  {isFirst && showHomeIcon ? (
                    <Home className="size-4" />
                  ) : Icon ? (
                    <Icon className="size-4" />
                  ) : null}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium',
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && showHomeIcon ? (
                    <Home className="size-4" />
                  ) : Icon ? (
                    <Icon className="size-4" />
                  ) : null}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
