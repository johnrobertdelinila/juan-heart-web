/**
 * Framer Motion Configuration
 * Centralized animation variants and configurations for Juan Heart Web Application
 * Following REDESIGN_PLAN.md specifications
 */

import { Variants } from 'framer-motion';

/**
 * Clinical-grade easing function
 * Cubic bezier curve for smooth, professional animations
 */
export const clinicalEasing = [0.4, 0, 0.2, 1] as const;

/**
 * Animation durations (in seconds)
 */
export const durations = {
  fast: 0.15,
  normal: 0.25,
  card: 0.3,
} as const;

/**
 * Card animation variants
 * Used for staggered entrance animations and hover effects
 */
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05, // 50ms stagger between cards
      duration: durations.card,
      ease: clinicalEasing,
    },
  }),
  hover: {
    y: -4, // 4px lift on hover
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    borderColor: 'rgb(203 213 225 / 0.7)',
    transition: {
      duration: durations.normal,
      ease: clinicalEasing,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Subtle card variants (no hover lift)
 * Used for alert cards, banner cards, or cards that shouldn't lift on hover
 */
export const subtleCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: durations.card,
      ease: clinicalEasing,
    },
  }),
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Interactive card variants (enhanced hover)
 * Used for clickable cards, card links, or interactive elements
 */
export const interactiveCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: durations.card,
      ease: clinicalEasing,
    },
  }),
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(220 38 38 / 0.1), 0 8px 10px -6px rgb(220 38 38 / 0.1)',
    borderColor: 'rgb(220 38 38 / 0.5)', // Heart Red border on hover
    transition: {
      duration: durations.normal,
      ease: clinicalEasing,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: durations.fast,
      ease: clinicalEasing,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Container variants for stagger animations
 * Used to orchestrate child card animations
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between each child
      delayChildren: 0.1, // Wait 100ms before starting children animations
    },
  },
};

/**
 * Check if user prefers reduced motion
 * Used to disable animations for accessibility
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation variants based on reduced motion preference
 * Returns undefined if reduced motion is preferred, which disables animations
 */
export const getAnimationVariants = (variants: Variants): Variants | undefined => {
  return prefersReducedMotion() ? undefined : variants;
};

/**
 * Input field animation variants
 * Used for text inputs with error shake and success animations
 */
export const inputVariants: Variants = {
  normal: {
    x: 0,
    backgroundColor: 'transparent',
  },
  error: {
    x: [-5, 5, -5, 5, 0],
    backgroundColor: [
      'transparent',
      'rgba(220, 38, 38, 0.05)',
      'transparent',
      'rgba(220, 38, 38, 0.05)',
      'transparent',
    ],
    transition: {
      x: {
        duration: 0.3,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
      backgroundColor: {
        duration: 0.5,
      },
    },
  },
  success: {
    borderColor: '#16a34a',
    transition: {
      duration: durations.card,
      ease: clinicalEasing,
    },
  },
  focus: {
    scale: 1,
    transition: {
      duration: durations.fast,
      ease: clinicalEasing,
    },
  },
};

/**
 * Label float animation variants
 * Used for floating labels that move up when input is focused
 */
export const labelFloatVariants: Variants = {
  normal: {
    scale: 1,
    y: 0,
    color: 'rgb(100 116 139)', // slate-500
  },
  focused: {
    scale: 0.875, // Scale to 87.5% (smaller)
    y: -1.5,
    color: 'rgb(30 41 59)', // slate-800
    transition: {
      duration: 0.2,
      ease: clinicalEasing,
    },
  },
};

/**
 * Form message animation variants
 * Used for error/validation messages that fade in
 */
export const formMessageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    height: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: {
      duration: 0.2,
      ease: clinicalEasing,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    height: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Checkbox animation variants
 * Used for checkbox toggle with spring animation
 */
export const checkboxVariants: Variants = {
  unchecked: {
    scale: 1,
    backgroundColor: 'transparent',
  },
  checked: {
    scale: [0.8, 1.05, 1],
    backgroundColor: '#dc2626', // Heart Red
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      duration: 0.3,
    },
  },
  error: {
    x: [-2, 2, -2, 0],
    borderColor: '#dc2626',
    transition: {
      x: {
        duration: 0.2,
        type: 'spring',
        stiffness: 400,
      },
    },
  },
};

/**
 * Checkmark icon animation variants
 * Used for the checkmark inside checkbox
 */
export const checkmarkVariants: Variants = {
  unchecked: {
    scale: 0,
    opacity: 0,
  },
  checked: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      delay: 0.05,
    },
  },
};

/**
 * Table row animation variants
 * Used for staggered entrance animations and smooth row additions
 */
export const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03, // 30ms stagger for performance
      duration: 0.2,
      ease: clinicalEasing,
    },
  }),
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

/**
 * Table row hover animation variants
 * Subtle background color change on hover
 */
export const tableRowHoverVariants: Variants = {
  hover: {
    backgroundColor: 'rgb(248 250 252)', // slate-50
    transition: { duration: 0.15 },
  },
};

/**
 * Sort indicator animation variants
 * Rotating arrow for ascending/descending/none states
 */
export const sortIndicatorVariants: Variants = {
  asc: { rotate: 0, transition: { duration: 0.2 } },
  desc: { rotate: 180, transition: { duration: 0.2 } },
  none: { rotate: 90, opacity: 0.3, transition: { duration: 0.2 } },
};

/**
 * Filter panel animation variants
 * Smooth height expansion for filter panels
 */
export const filterPanelVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * Bulk action toolbar animation variants
 * Spring-based entrance from bottom when rows are selected
 */
export const bulkActionToolbarVariants: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

/**
 * Loading skeleton animation variants
 * Pulsing effect for loading states
 */
export const loadingSkeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Number counter animation for statistics
 * Smooth counting animation with spring-like easing
 */
export const numberCounterVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1], // Spring-like easing
    },
  },
};

/**
 * Chart entrance animations
 * Used for data visualization components
 */
export const chartVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Page transition wrapper
 * Smooth page entrance and exit animations
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

/**
 * Gradient shimmer for loading states
 * Animated background position for shimmer effect
 */
export const gradientShimmerVariants: Variants = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Quick action hover effects
 * Subtle scale and interaction feedback
 */
export const quickActionVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: { scale: 0.98 },
};

/**
 * Shimmer effect for skeleton loaders
 * Horizontal shimmer animation
 */
export const shimmerVariants: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Urgent pulse for high-risk items
 * Attention-grabbing pulse animation for urgent alerts
 */
export const urgentPulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Stagger container for orchestrating stat card grid animations
 * Phase 3.1: Used for the 4 main statistic cards grid
 */
export const staggerContainerVariants: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay between each card
      delayChildren: 0.2, // Start after 200ms
    },
  },
};

/**
 * Stagger item variants for stat cards
 * Phase 3.1: Individual card entrance with scale effect
 */
export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], // Smooth deceleration
    },
  },
};

/**
 * Progress bar animation variants
 * Phase 3.4: Used for system health metric bars with width animation
 */
export const progressBarVariants: Variants = {
  initial: { width: 0, opacity: 0 },
  animate: (width: string | number) => ({
    width,
    opacity: 1,
    transition: {
      width: { duration: 1, ease: 'easeOut' },
      opacity: { duration: 0.3 },
    },
  }),
};

/**
 * Priority queue row stagger variants
 * Phase 3.3: Staggered entrance for table rows with horizontal slide
 */
export const priorityQueueRowVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05, // 50ms stagger
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

/**
 * Risk badge pulse variants
 * Phase 3.5: Conditional pulse for High Risk and URGENT badges
 */
export const riskBadgePulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  static: { scale: 1 },
};

/**
 * Animated gradient variants
 * Phase 3.6: Subtle animated gradient for header cards
 */
export const animatedGradientVariants: Variants = {
  initial: { backgroundPosition: '0% 50%' },
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
