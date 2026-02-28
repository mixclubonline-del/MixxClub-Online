

# Scroll-Triggered Card Animations in Features Chapter

## What Changes

Replace the Framer Motion `whileInView` animations on the feature cards with the project's native CSS + Intersection Observer approach, aligning with the **visual animation standard** (CSS `@keyframes` + `useInView` over Framer Motion for section reveals).

## Approach

Refactor `FeaturesChapter.tsx` to use the existing native `useInView` hook (`src/hooks/useInView.ts`) for triggering visibility, combined with the existing CSS `.stagger-item` classes (`src/index.css`) for staggered fade/slide-in animations. The hero and CTA sections will also switch to this pattern for consistency.

### Changes to `src/components/storybook/chapters/FeaturesChapter.tsx`

1. **Remove Framer Motion** -- drop the `motion` import entirely from this component
2. **Import `useInView`** from `@/hooks/useInView`
3. **Hero section**: Use `useInView` to toggle an `opacity-0 translate-y-5` to `opacity-100 translate-y-0` CSS transition on mount
4. **Feature cards grid**: Apply `useInView` on the grid container; when visible, add `stagger-item` class to each card via a conditional, leveraging the existing `:nth-child` delay ladder in `index.css` (delays from 0.05s to 0.3s for cards 1-6)
5. **Hover effect**: Replace `whileHover={{ y: -4 }}` with a native Tailwind `hover:-translate-y-1` class
6. **CTA button**: Same `useInView`-driven opacity transition

### No New CSS Needed

The existing `stagger-item` classes in `index.css` already cover 8 children with progressive delays and use the `fade-in` keyframe (translateY + opacity). The feature grid has exactly 6 cards -- fits perfectly within the existing ladder.

### No Other Files Changed

This is a self-contained refactor of one component. The `useInView` hook and CSS stagger classes are already in the codebase.

## Technical Detail

```text
Before:  motion.div + whileInView + Framer transition
After:   div + useInView hook + CSS transition/stagger-item class + GPU-composited transforms
```

The `useInView` hook uses native `IntersectionObserver` with `once: true`, so cards animate in once as the user scrolls within the chapter panel and stay visible. The CSS `animation` property with `backwards` fill mode ensures cards start hidden until their staggered delay fires.

