'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { labelFloatVariants, getAnimationVariants } from '@/lib/framer-config';

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  /**
   * Enable floating label animation
   * Label scales down and moves up when input is focused
   * @default false
   */
  floating?: boolean;
  /**
   * Disable animations
   * @default false
   */
  disableAnimations?: boolean;
}

function Label({
  className,
  floating = false,
  disableAnimations = false,
  ...props
}: LabelProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  // Handle focus state for floating label
  React.useEffect(() => {
    if (!floating) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    // Find associated input by htmlFor
    const input = props.htmlFor
      ? document.getElementById(props.htmlFor)
      : null;

    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);

      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, [floating, props.htmlFor]);

  const variants = disableAnimations ? undefined : getAnimationVariants(labelFloatVariants);

  if (floating && variants) {
    return (
      <motion.label
        data-slot="label"
        className={cn(
          'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 origin-left',
          className
        )}
        variants={variants}
        animate={isFocused ? 'focused' : 'normal'}
        htmlFor={props.htmlFor}
        {...props}
      />
    );
  }

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Label };
