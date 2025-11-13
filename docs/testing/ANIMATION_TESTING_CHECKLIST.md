# Dashboard Animation Testing Checklist
## Phase 2: Core Integration

**File:** `frontend/src/app/(dashboard)/dashboard/page.tsx`
**Test Date:** _______________
**Tester:** _______________

---

## Quick Start

1. Start dev server: `cd frontend && npm run dev`
2. Open browser: `http://localhost:3000/dashboard`
3. Open DevTools: F12 → Performance tab
4. Test each section below

---

## Test 1: Page Load Animations ✅

### What to Look For:
- [ ] **Page Transition (first 300ms)**
  - Entire dashboard fades in smoothly
  - Subtle slide-up motion (10px)
  - No jarring appearance

### How to Test:
1. Hard refresh page (Cmd/Ctrl + Shift + R)
2. Watch the entire dashboard appear
3. Should feel smooth and professional

**Expected:** Smooth fade-in + slide-up in 0.3 seconds
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 2: Number Animations ✅

### What to Look For:
- [ ] **Card 1: Total Assessments** (1 second animation)
  - Number counts from 0 to actual value
  - Smooth counting, not choppy
  - Number has proper thousand separators (e.g., 1,234)

- [ ] **Card 2: Active Patients** (1.2 seconds)
  - Slightly slower than Card 1
  - Creates cascading effect

- [ ] **Card 3: Pending Referrals** (1.4 seconds)
  - Even slower, cascade continues

- [ ] **Card 4: Average Risk Score** (1.6 seconds)
  - Slowest animation
  - Shows decimal value (e.g., 87.3)
  - Decimal animates smoothly

### How to Test:
1. Hard refresh page
2. Watch all 4 cards in top grid
3. Count: "1 Mississippi, 2 Mississippi"
4. All should finish by 2 seconds

**Expected:** Cascading number animations over 1.6 seconds
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 3: Loading Skeletons ✅

### What to Look For:
- [ ] **Before Data Loads:**
  - 4 shimmer skeleton cards in top grid
  - 3 skeleton sections below (matches actual layout)
  - Shimmer animation moves left to right

### How to Test:
1. Throttle network (DevTools → Network → Slow 3G)
2. Refresh page
3. Watch loading state
4. Should see skeleton placeholders, not spinner

**Alternative Test (if page loads too fast):**
1. Add `await new Promise(r => setTimeout(r, 3000));` to fetchData
2. Refresh to see 3-second skeleton display

**Expected:** Layout-matching skeletons with shimmer effect
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 4: Quick Action Animations ✅

### What to Look For:
- [ ] **Review Queue (Red Card)**
  - Hover: Scales up 2% (subtle growth)
  - Click/Tap: Scales down 2% (button press feel)
  - Animated number counts inside card

- [ ] **Manage Referrals**
  - Same hover/tap behavior
  - White card with border

- [ ] **Analytics Report**
  - Same hover/tap behavior

- [ ] **Patient Registry**
  - Same hover/tap behavior
  - Number animates inside

### How to Test:
1. Hover mouse over each card slowly
2. Should see subtle scale-up (barely noticeable but present)
3. Click and hold each card
4. Should see scale-down on press

**Expected:** Subtle 2% scale on hover, compress on tap
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 5: Scroll-Triggered Animations ✅

### What to Look For:
- [ ] **Priority Assessment Queue Section**
  - Fades in when you scroll near it
  - Slides up slightly during fade-in
  - Animation smooth (500ms)

- [ ] **System Health Section**
  - Same behavior as above
  - Only animates once (not on every scroll)

### How to Test:
1. Refresh page and immediately scroll to top
2. Slowly scroll down
3. Watch for sections to fade in before fully visible
4. Scroll back up and down again
5. Sections should NOT re-animate

**Expected:** One-time scroll-triggered fade-in + slide-up
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 6: Performance Check ✅

### Frame Rate Test:
- [ ] **Open DevTools Performance Tab**
  1. Click Record
  2. Refresh page
  3. Wait 3 seconds
  4. Stop recording
  5. Check FPS graph

**Expected:** Consistent 60 FPS (green line at top)
**Acceptable:** Brief dips to 50 FPS during heavy animations
**Fail:** Sustained below 30 FPS

**Actual FPS:** _______________
**Pass/Fail:** _______________

### CPU Usage:
- [ ] **Check CPU in Activity Monitor/Task Manager**
  - During page load: < 50% CPU
  - During animations: < 70% CPU
  - After animations complete: < 30% CPU

**Actual CPU:** _______________
**Pass/Fail:** _______________

---

## Test 7: Accessibility - Reduced Motion ✅

### What to Look For:
- [ ] **All animations disabled**
  - Numbers appear instantly (no counting)
  - No page transition
  - No scroll animations
  - Hover effects still work (CSS fallback)

### How to Test (macOS):
1. System Settings → Accessibility → Display
2. Enable "Reduce motion"
3. Refresh dashboard
4. Should see instant numbers, no animations

### How to Test (Windows):
1. Settings → Ease of Access → Display
2. Enable "Show animations in Windows"
3. Refresh dashboard

### How to Test (Browser Override):
1. Open DevTools
2. Console: `document.documentElement.style.setProperty('--motion', 'reduce')`
3. Refresh page

**Expected:** All animations skip, content appears instantly
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 8: Mobile Responsiveness ✅

### What to Look For:
- [ ] **Mobile Viewport (< 768px)**
  - Animations still work
  - Touch tap animations work
  - Cards stack vertically
  - Performance maintained

### How to Test:
1. DevTools → Toggle Device Toolbar (Cmd/Ctrl + Shift + M)
2. Select "iPhone 12 Pro"
3. Refresh page
4. Test all animations
5. Try tapping Quick Action cards

**Expected:** All animations work, touch-friendly
**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 9: Edge Cases ✅

### Zero Values:
- [ ] Test with `dashboardData = null`
- [ ] All numbers should show 0, not crash
- [ ] Animations should still run (0 → 0)

### Large Numbers:
- [ ] Test with 100,000+ assessments
- [ ] Number should have thousand separators
- [ ] Animation should complete in same time

### Decimal Precision:
- [ ] Test risk score with 87.123456
- [ ] Should display as 87.1 (1 decimal)
- [ ] Animation should be smooth

**Pass/Fail:** _______________
**Notes:** _______________

---

## Test 10: Browser Compatibility ✅

Test in these browsers:

- [ ] **Chrome/Edge (Chromium):** _______________
- [ ] **Firefox:** _______________
- [ ] **Safari:** _______________
- [ ] **Mobile Safari (iOS):** _______________
- [ ] **Chrome Mobile (Android):** _______________

**Expected:** Consistent behavior across all browsers
**Pass/Fail:** _______________

---

## Common Issues & Solutions

### Issue: Numbers don't animate
**Check:**
- Is `framer-motion` installed? (`npm list framer-motion`)
- Is `AnimatedNumber` component imported correctly?
- Are there console errors?

### Issue: Page doesn't fade in
**Check:**
- Is `motion.div` wrapper present? (lines 92-97)
- Is `pageTransitionVariants` imported?
- Check for JSX syntax errors

### Issue: Animations are choppy
**Check:**
- Close other apps to free CPU
- Disable browser extensions
- Check if GPU acceleration is enabled
- Test in Incognito/Private mode

### Issue: Skeletons don't show
**Check:**
- Are `StatCardSkeleton` and `ChartSkeleton` imported?
- Is loading state `true` initially?
- Check network throttling settings

---

## Final Verdict

**Overall Status:** PASS / FAIL / NEEDS ADJUSTMENT

**Critical Issues (must fix before Phase 3):**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Minor Issues (can defer to Phase 3):**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Performance Grade:**
- [ ] A+ (60 FPS, < 30% CPU, instant feel)
- [ ] A (55-60 FPS, < 40% CPU, smooth)
- [ ] B (50-55 FPS, < 50% CPU, acceptable)
- [ ] C (40-50 FPS, < 60% CPU, noticeable lag)
- [ ] F (< 40 FPS, > 60% CPU, unusable)

**Recommendation:**
- [ ] Proceed to Phase 3 (Polish & Enhancement)
- [ ] Make adjustments first
- [ ] Revert to static (if animations hurt UX)

---

## Tester Sign-Off

**Tested By:** _______________
**Date:** _______________
**Time Spent:** _______________ minutes
**Approved for Phase 3:** YES / NO

**Additional Comments:**
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

**Next Steps:**
1. If PASS: Review PHASE_2_ANIMATION_IMPLEMENTATION_REPORT.md
2. Approve Phase 3: Polish & Enhancement
3. If FAIL: Report issues to jh-frontend-engineer for fixes
