'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import { type ReactNode, useRef, useState, useEffect } from 'react';

type AnimationPreset = 'fade-up' | 'fade-in' | 'scale-up';

const presets: Record<AnimationPreset, { hidden: TargetAndTransition; visible: TargetAndTransition }> = {
  'fade-up': {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'scale-up': {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

/**
 * Wait for hydration + two animation frames so IntersectionObserver
 * can report which elements are already in the viewport before we
 * hide any off-screen elements.
 */
function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHydrated(true));
    });
  }, []);
  return hydrated;
}

export function AnimateOnScroll({
  children,
  preset = 'fade-up',
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const hydrated = useHydrated();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const { hidden, visible } = presets[preset];

  // Before hydration: render visible (SSR-safe, no invisible content)
  // After hydration + in view: render visible (already seen by user)
  // After hydration + not in view: snap to hidden, animate in when scrolled to
  const isVisible = !hydrated || isInView;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={isVisible ? visible : hidden}
      transition={
        isVisible && hydrated
          ? { duration, delay, ease: [0.25, 0.1, 0.25, 1] }
          : { duration: 0 }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const hydrated = useHydrated();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const isVisible = !hydrated || isInView;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: { staggerChildren: isVisible && hydrated ? staggerDelay : 0 },
        },
        hidden: {
          transition: { duration: 0 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, transition: { duration: 0 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
