# Phase 2: Before/After Code Snippets
## Quick Reference for Code Review

---

## 1. Imports Section

### BEFORE (Lines 1-21)
```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Heart,
} from 'lucide-react';
import { getNationalOverview } from '@/lib/api/analytics';
```

### AFTER (Lines 1-29)
```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion'; // ✨ NEW
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Heart,
} from 'lucide-react';
import { getNationalOverview } from '@/lib/api/analytics';
import { AnimatedNumber } from '@/components/animations'; // ✨ NEW
import { StatCardSkeleton, ChartSkeleton } from '@/components/animations'; // ✨ NEW
import {
  pageTransitionVariants,
  chartVariants,
  quickActionVariants,
} from '@/lib/framer-config'; // ✨ NEW
```

**Changes:** Added 6 new imports for animations

---

## 2. Loading State

### BEFORE (Lines 64-73)
```tsx
if (loading) {
  return (
    <div className="relative z-0 flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-heart-red mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-slate-600">Loading dashboard data...</p>
      </div>
    </div>
  );
}
```

### AFTER (Lines 72-89)
```tsx
if (loading) {
  return (
    <div className="relative z-0 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
      <ChartSkeleton />
    </div>
  );
}
```

**Changes:** Replaced spinner with layout-matching skeleton components

---

## 3. Page Wrapper

### BEFORE (Line 74)
```tsx
return (
  <div className="relative z-0 space-y-6">
```

### AFTER (Lines 92-97)
```tsx
return (
  <motion.div
    variants={pageTransitionVariants}
    initial="initial"
    animate="animate"
    className="relative z-0 space-y-6"
  >
```

**Changes:** Replaced `<div>` with `<motion.div>` and added page transition props

---

## 4. Card 1 - Total Assessments Number

### BEFORE (Lines 150-152)
```tsx
<CardContent className="relative">
  <div className="metric-value">
    {dashboardData?.summary.total_assessments.toLocaleString() || 0}
  </div>
```

### AFTER (Lines 172-179)
```tsx
<CardContent className="relative">
  <div className="metric-value">
    <AnimatedNumber
      value={dashboardData?.summary.total_assessments || 0}
      duration={1}
      className="inline-block"
    />
  </div>
```

**Changes:** Static number → AnimatedNumber with 1 second duration

---

## 5. Card 2 - Active Patients Number

### BEFORE (Lines 197-199)
```tsx
<CardContent className="relative">
  <div className="metric-value">
    {dashboardData?.summary.total_assessments.toLocaleString() || 0}
  </div>
```

### AFTER (Lines 223-229)
```tsx
<CardContent className="relative">
  <div className="metric-value">
    <AnimatedNumber
      value={dashboardData?.summary.total_assessments || 0}
      duration={1.2}
      className="inline-block"
    />
  </div>
```

**Changes:** Static number → AnimatedNumber with 1.2 second duration (staggered)

---

## 6. Card 3 - Pending Referrals Number

### BEFORE (Line 235)
```tsx
<div className="metric-value">{dashboardData?.summary.pending_referrals || 0}</div>
```

### AFTER (Lines 265-270)
```tsx
<div className="metric-value">
  <AnimatedNumber
    value={dashboardData?.summary.pending_referrals || 0}
    duration={1.4}
    className="inline-block"
  />
</div>
```

**Changes:** Static number → AnimatedNumber with 1.4 second duration

---

## 7. Card 4 - Average Risk Score (with Decimals)

### BEFORE (Lines 270-272)
```tsx
<CardContent className="relative">
  <div className="metric-value">
    {dashboardData?.summary.average_risk_score.toFixed(1) || '0.0'}
  </div>
```

### AFTER (Lines 306-313)
```tsx
<CardContent className="relative">
  <div className="metric-value">
    <AnimatedNumber
      value={dashboardData?.summary.average_risk_score || 0}
      decimals={1}
      duration={1.6}
      className="inline-block"
    />
  </div>
```

**Changes:** Static number → AnimatedNumber with `decimals={1}` prop for decimal display

---

## 8. Priority Assessment Queue Section

### BEFORE (Lines 306-308)
```tsx
{/* Recent Activity */}
<div className="grid gap-6 lg:grid-cols-3">
  {/* Priority Assessment Queue */}
  <Card index={5} className="clinical-card lg:col-span-2">
```

### AFTER (Lines 346-356)
```tsx
{/* Recent Activity */}
<div className="grid gap-6 lg:grid-cols-3">
  {/* Priority Assessment Queue */}
  <motion.div
    variants={chartVariants}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true, margin: '-100px' }}
    className="lg:col-span-2"
  >
    <Card index={5} className="clinical-card">
```

**Changes:** Wrapped Card in motion.div for scroll-triggered fade-in

**Closing Tag Added (Line 464):**
```tsx
    </Card>
  </motion.div>
```

---

## 9. Quick Action - Review Queue (with AnimatedNumber)

### BEFORE (Lines 427-443)
```tsx
<Link href="/clinical" className="block">
  <div className="bg-gradient-primary group border-heart-red-dark/20 w-full cursor-pointer rounded-xl border p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 shadow-sm">
        <Activity className="h-5 w-5 text-white" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold tracking-tight text-white">
          Review Queue
        </div>
        <div className="mt-0.5 text-xs font-medium text-white/90">
          {dashboardData?.summary.high_risk_cases || 0} high-risk assessments
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-white/80 transition-colors group-hover:text-white" strokeWidth={1.5} />
    </div>
  </div>
</Link>
```

### AFTER (Lines 476-503)
```tsx
<Link href="/clinical" className="block">
  <motion.div
    variants={quickActionVariants}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    className="bg-gradient-primary group border-heart-red-dark/20 w-full cursor-pointer rounded-xl border p-4 text-left transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 shadow-sm">
        <Activity className="h-5 w-5 text-white" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold tracking-tight text-white">
          Review Queue
        </div>
        <div className="mt-0.5 text-xs font-medium text-white/90">
          <AnimatedNumber
            value={dashboardData?.summary.high_risk_cases || 0}
            duration={1}
            className="inline-block"
          />{' '}
          high-risk assessments
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-white/80 transition-colors group-hover:text-white" strokeWidth={1.5} />
    </div>
  </motion.div>
</Link>
```

**Changes:**
1. Replaced `<div>` with `<motion.div>`
2. Added quickActionVariants props
3. Replaced static number with AnimatedNumber
4. Removed Tailwind hover/tap classes (now handled by Framer Motion)

---

## 10. Quick Action - Manage Referrals

### BEFORE (Lines 445-463)
```tsx
<Link href="/referrals" className="block">
  <div className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl active:scale-[0.98]">
    <div className="flex items-center gap-3">
      <div className="bg-warning/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
        <FileText className="text-warning h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Manage Referrals
        </div>
        <div className="mt-0.5 text-xs font-medium text-slate-600">
          {dashboardData?.summary.pending_referrals || 0} pending referrals
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
    </div>
  </div>
</Link>
```

### AFTER (Lines 506-533)
```tsx
<Link href="/referrals" className="block">
  <motion.div
    variants={quickActionVariants}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="bg-warning/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
        <FileText className="text-warning h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Manage Referrals
        </div>
        <div className="mt-0.5 text-xs font-medium text-slate-600">
          <AnimatedNumber
            value={dashboardData?.summary.pending_referrals || 0}
            duration={1}
            className="inline-block"
          />{' '}
          pending referrals
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
    </div>
  </motion.div>
</Link>
```

**Changes:** Same pattern as Review Queue card

---

## 11. Quick Action - Patient Registry

### BEFORE (Lines 484-500)
```tsx
<Link href="/patients" className="block">
  <div className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl active:scale-[0.98]">
    <div className="flex items-center gap-3">
      <div className="bg-success/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
        <Users className="text-success h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Patient Registry
        </div>
        <div className="mt-0.5 text-xs font-medium text-slate-600">
          {dashboardData?.summary.total_assessments || 0} active patients
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
    </div>
  </div>
</Link>
```

### AFTER (Lines 561-588)
```tsx
<Link href="/patients" className="block">
  <motion.div
    variants={quickActionVariants}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="bg-success/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
        <Users className="text-success h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Patient Registry
        </div>
        <div className="mt-0.5 text-xs font-medium text-slate-600">
          <AnimatedNumber
            value={dashboardData?.summary.total_assessments || 0}
            duration={1}
            className="inline-block"
          />{' '}
          active patients
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
    </div>
  </motion.div>
</Link>
```

**Changes:** Same pattern as other quick action cards

---

## 12. System Health Section

### BEFORE (Lines 507-508)
```tsx
{/* System Health & Performance */}
<Card index={7} className="clinical-card">
```

### AFTER (Lines 571-578)
```tsx
{/* System Health & Performance */}
<motion.div
  variants={chartVariants}
  initial="initial"
  whileInView="animate"
  viewport={{ once: true, margin: '-100px' }}
>
  <Card index={7} className="clinical-card">
```

**Changes:** Wrapped Card in motion.div for scroll-triggered fade-in

**Closing Tag Added (Line 706):**
```tsx
  </Card>
</motion.div>
```

---

## 13. Final Closing Tags

### BEFORE (Lines 635-637)
```tsx
      </Card>
    </div>
  );
}
```

### AFTER (Lines 705-709)
```tsx
      </Card>
      </motion.div> {/* Close System Health motion wrapper */}
    </motion.div> {/* Close page transition wrapper */}
  );
}
```

**Changes:** Added 2 closing motion.div tags for proper nesting

---

## Summary of Changes

| Category | Before | After | Diff |
|----------|--------|-------|------|
| **Total Lines** | 638 | 709 | +71 |
| **Imports** | 21 lines | 29 lines | +8 |
| **Motion Wrappers** | 0 | 10 | +10 |
| **AnimatedNumber** | 0 | 7 | +7 |
| **Skeleton Components** | 0 | 7 | +7 |
| **Animation Props** | 0 | ~35 props | +35 |

---

## Animation Props Reference

### pageTransitionVariants Props
```tsx
variants={pageTransitionVariants}
initial="initial"
animate="animate"
```

### chartVariants Props
```tsx
variants={chartVariants}
initial="initial"
whileInView="animate"
viewport={{ once: true, margin: '-100px' }}
```

### quickActionVariants Props
```tsx
variants={quickActionVariants}
initial="initial"
whileHover="hover"
whileTap="tap"
```

### AnimatedNumber Props
```tsx
value={number}           // The target number to animate to
duration={1}             // Animation duration in seconds
decimals={1}             // (Optional) Decimal places (default: 0)
className="inline-block" // Additional CSS classes
```

---

## Key Patterns

1. **All static numbers** wrapped in `<AnimatedNumber>`
2. **All quick action cards** wrapped in `<motion.div>` with `quickActionVariants`
3. **Large content sections** wrapped in `<motion.div>` with `chartVariants`
4. **Page wrapper** changed from `<div>` to `<motion.div>` with `pageTransitionVariants`
5. **Loading state** uses skeleton components instead of spinner
6. **All animations** respect `prefers-reduced-motion` automatically

---

## Files Modified

- ✅ `/frontend/src/app/(dashboard)/dashboard/page.tsx` (638 → 709 lines)

## Files Referenced (No Changes)

- `/frontend/src/components/animations/AnimatedNumber.tsx`
- `/frontend/src/components/animations/LoadingShimmer.tsx`
- `/frontend/src/lib/framer-config.ts`

---

**End of Code Snippets Reference**
