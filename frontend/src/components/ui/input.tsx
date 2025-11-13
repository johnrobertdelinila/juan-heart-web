'use client';

import * as React from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { inputVariants, getAnimationVariants } from '@/lib/framer-config';

interface InputProps extends Omit<HTMLMotionProps<'input'>, 'animate' | 'variants'> {
  /**
   * Indicates field has validation error
   * Triggers shake animation
   */
  hasError?: boolean;
  /**
   * Indicates field validation passed
   * Shows success border with optional checkmark
   */
  hasSuccess?: boolean;
  /**
   * Show checkmark icon on success state
   * @default false
   */
  showSuccessIcon?: boolean;
  /**
   * Disable animations
   * @default false
   */
  disableAnimations?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      hasError = false,
      hasSuccess = false,
      showSuccessIcon = false,
      disableAnimations = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    // Determine animation state
    const getAnimationState = () => {
      if (hasError) return 'error';
      if (hasSuccess) return 'success';
      if (isFocused) return 'focus';
      return 'normal';
    };

    const variants = disableAnimations ? undefined : getAnimationVariants(inputVariants);

    // If success icon is needed, wrap in div
    if (showSuccessIcon && hasSuccess) {
      return (
        <div className="relative w-full">
          <motion.input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              hasSuccess && 'border-[#16a34a] focus-visible:border-[#16a34a] focus-visible:ring-[#16a34a]/30 pr-10',
              className
            )}
            variants={variants}
            animate={getAnimationState()}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e as React.FocusEvent<HTMLInputElement>);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
            }}
            aria-invalid={hasError}
            {...props}
          />
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <Check className="w-4 h-4 text-[#16a34a]" strokeWidth={1.5} />
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    return (
      <motion.input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          hasSuccess && 'border-[#16a34a] focus-visible:border-[#16a34a] focus-visible:ring-[#16a34a]/30',
          className
        )}
        variants={variants}
        animate={getAnimationState()}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e as React.FocusEvent<HTMLInputElement>);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
        }}
        aria-invalid={hasError}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
