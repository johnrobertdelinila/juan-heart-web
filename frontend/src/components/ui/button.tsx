import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary - Heart Red with hover lift
        default:
          'bg-[#dc2626] text-white shadow-sm hover:bg-[#b91c1c] focus-visible:ring-[#dc2626]/30',
        // Destructive - Same as primary for consistency
        destructive:
          'bg-[#dc2626] text-white shadow-sm hover:bg-[#b91c1c] focus-visible:ring-[#dc2626]/30',
        // Outline variant
        outline:
          'border border-slate-200 bg-white shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700',
        // Secondary variant
        secondary:
          'bg-slate-100 text-slate-900 shadow-xs hover:bg-slate-200 focus-visible:ring-slate-200/50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
        // Ghost variant
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        // Link variant
        link: 'text-[#dc2626] underline-offset-4 hover:underline hover:text-[#b91c1c]',
      },
      size: {
        default: 'h-10 px-6 py-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 py-2 text-xs',
        lg: 'h-12 rounded-md px-8 py-4 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Motion variants for button animations
const buttonMotionVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    y: -2,
    boxShadow: '0 10px 25px -5px rgb(220 38 38 / 0.3)',
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Variants for ghost and link buttons (no lift)
const subtleMotionVariants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'animate' | 'variants'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  disableAnimations?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      disableAnimations = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Use subtle animations for ghost and link variants
    const useSubtleAnimation = variant === 'ghost' || variant === 'link';
    const motionVariants = useSubtleAnimation
      ? subtleMotionVariants
      : buttonMotionVariants;

    // Respect reduced motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const shouldAnimate = !disableAnimations && !disabled && !prefersReducedMotion;

    if (asChild) {
      return (
        <Slot
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      );
    }

    return (
      <motion.button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        variants={shouldAnimate ? motionVariants : undefined}
        initial="initial"
        whileHover={shouldAnimate && !useSubtleAnimation ? 'hover' : undefined}
        whileTap={shouldAnimate ? 'tap' : undefined}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
