'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

import { cn } from '@/lib/utils';
import { inputVariants, getAnimationVariants } from '@/lib/framer-config';

interface TextareaProps
  extends Omit<HTMLMotionProps<'textarea'>, 'animate' | 'variants'> {
  /**
   * Indicates field has validation error
   * Triggers shake animation
   */
  hasError?: boolean;
  /**
   * Indicates field validation passed
   * Shows success border
   */
  hasSuccess?: boolean;
  /**
   * Show character count below textarea
   * @default false
   */
  showCharCount?: boolean;
  /**
   * Disable animations
   * @default false
   */
  disableAnimations?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      hasError = false,
      hasSuccess = false,
      showCharCount = false,
      disableAnimations = false,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    // Track character count
    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    // Determine animation state
    const getAnimationState = () => {
      if (hasError) return 'error';
      if (hasSuccess) return 'success';
      if (isFocused) return 'focus';
      return 'normal';
    };

    const variants = disableAnimations ? undefined : getAnimationVariants(inputVariants);

    // Calculate character count percentage for color
    const getCharCountColor = () => {
      if (!maxLength) return 'text-slate-500';
      const percentage = (charCount / maxLength) * 100;
      if (percentage >= 100) return 'text-[#dc2626]'; // danger
      if (percentage >= 90) return 'text-[#f59e0b]'; // warning
      return 'text-slate-500';
    };

    // If character count is needed, wrap in div
    if (showCharCount) {
      return (
        <div className="w-full">
          <motion.textarea
            ref={ref}
            data-slot="textarea"
            className={cn(
              'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              hasSuccess && 'border-[#16a34a] focus-visible:border-[#16a34a] focus-visible:ring-[#16a34a]/30',
              className
            )}
            variants={variants}
            animate={getAnimationState()}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e as React.FocusEvent<HTMLTextAreaElement>);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e as React.FocusEvent<HTMLTextAreaElement>);
            }}
            onChange={(e) => {
              setCharCount(e.target.value.length);
              props.onChange?.(e as React.ChangeEvent<HTMLTextAreaElement>);
            }}
            aria-invalid={hasError}
            maxLength={maxLength}
            value={value}
            {...props}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'text-xs mt-1.5 transition-colors duration-200',
              getCharCountColor()
            )}
          >
            {maxLength ? `${charCount} / ${maxLength}` : charCount}
            {maxLength && charCount >= maxLength && ' (Maximum reached)'}
          </motion.div>
        </div>
      );
    }

    return (
      <motion.textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          hasSuccess && 'border-[#16a34a] focus-visible:border-[#16a34a] focus-visible:ring-[#16a34a]/30',
          className
        )}
        variants={variants}
        animate={getAnimationState()}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e as React.FocusEvent<HTMLTextAreaElement>);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e as React.FocusEvent<HTMLTextAreaElement>);
        }}
        onChange={(e) => {
          setCharCount(e.target.value.length);
          props.onChange?.(e as React.ChangeEvent<HTMLTextAreaElement>);
        }}
        aria-invalid={hasError}
        maxLength={maxLength}
        value={value}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
