'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { checkboxVariants, checkmarkVariants, getAnimationVariants } from '@/lib/framer-config';

interface CheckboxProps
  extends Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    'asChild' | 'onCheckedChange'
  > {
  /**
   * Controlled checked state
   */
  checked?: boolean;
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Indicates field has validation error
   * Triggers shake animation
   */
  hasError?: boolean;
  /**
   * Disable animations
   * @default false
   */
  disableAnimations?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      hasError = false,
      disableAnimations = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(checked);
    const [triggerError, setTriggerError] = React.useState(false);

    // Sync controlled state
    React.useEffect(() => {
      setIsChecked(checked);
    }, [checked]);

    // Trigger error animation when hasError changes
    React.useEffect(() => {
      if (hasError) {
        setTriggerError(true);
        const timeout = setTimeout(() => setTriggerError(false), 300);
        return () => clearTimeout(timeout);
      }
    }, [hasError]);

    const handleCheckedChange = (newChecked: boolean) => {
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
    };

    // Determine animation state
    const getAnimationState = () => {
      if (triggerError) return 'error';
      return isChecked ? 'checked' : 'unchecked';
    };

    const variants = disableAnimations ? undefined : getAnimationVariants(checkboxVariants);
    const iconVariants = disableAnimations ? undefined : getAnimationVariants(checkmarkVariants);

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(
          'peer shrink-0 rounded-sm border border-slate-300 ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-[#dc2626] data-[state=checked]:text-white data-[state=checked]:border-[#dc2626]',
          hasError && 'border-[#dc2626] ring-2 ring-[#dc2626]/20',
          className
        )}
        aria-invalid={hasError}
        asChild
        {...props}
      >
        <motion.button
          type="button"
          className="size-5 inline-flex items-center justify-center"
          variants={variants}
          animate={getAnimationState()}
          whileHover={!disabled && !disableAnimations ? { scale: 1.05 } : undefined}
          whileTap={!disabled && !disableAnimations ? { scale: 0.95 } : undefined}
        >
          <AnimatePresence mode="wait">
            {isChecked && (
              <motion.div
                key="checkmark"
                variants={iconVariants}
                initial={iconVariants ? 'unchecked' : undefined}
                animate={iconVariants ? 'checked' : undefined}
                exit={iconVariants ? 'unchecked' : undefined}
              >
                <Check className="size-4" strokeWidth={1.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
