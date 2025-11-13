'use client';

import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/framer-config';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatNumber?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatNumber,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const shouldAnimate = !prefersReducedMotion() && isInView;

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (latest) => {
    const formatted = latest.toFixed(decimals);
    if (formatNumber) {
      return formatNumber(Number(formatted));
    }
    return Number(formatted).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  });

  useEffect(() => {
    if (shouldAnimate) {
      spring.set(value);
    }
  }, [spring, value, shouldAnimate]);

  if (!shouldAnimate) {
    const formatted = value.toFixed(decimals);
    const displayValue = formatNumber
      ? formatNumber(Number(formatted))
      : Number(formatted).toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    return (
      <span ref={ref} className={className}>
        {prefix}
        {displayValue}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}
