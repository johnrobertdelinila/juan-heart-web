import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';
import {
  cardVariants,
  subtleCardVariants,
  interactiveCardVariants,
  getAnimationVariants,
} from '@/lib/framer-config';

interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'animate' | 'variants'> {
  /**
   * Index for stagger animation
   * Each card in a list should have an incrementing index (0, 1, 2, ...)
   */
  index?: number;
  /**
   * Enable/disable animations
   * @default true
   */
  animate?: boolean;
  /**
   * Disable hover lift effect
   * Used for alert cards, banner cards, or non-interactive cards
   * @default false
   */
  disableHoverLift?: boolean;
  /**
   * Enhanced hover effect for interactive cards
   * Adds Heart Red border and stronger shadow on hover
   * @default false
   */
  interactive?: boolean;
}

function Card({
  className,
  index = 0,
  animate = true,
  disableHoverLift = false,
  interactive = false,
  ...props
}: CardProps) {
  // Select appropriate variant based on props
  const getVariants = () => {
    if (disableHoverLift) return subtleCardVariants;
    if (interactive) return interactiveCardVariants;
    return cardVariants;
  };

  const variants = animate ? getAnimationVariants(getVariants()) : undefined;

  return (
    <motion.div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm transition-colors',
        className
      )}
      custom={index}
      variants={variants}
      initial={animate ? 'hidden' : undefined}
      animate={animate ? 'visible' : undefined}
      exit={animate ? 'exit' : undefined}
      whileHover={
        animate && !disableHoverLift && variants ? 'hover' : undefined
      }
      whileTap={
        animate && interactive && variants ? 'tap' : undefined
      }
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
