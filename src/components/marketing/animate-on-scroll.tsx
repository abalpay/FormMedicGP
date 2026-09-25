'use client';

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

type AnimationPreset = 'fade-up' | 'fade-in' | 'scale-up';

/**
 * Scroll reveal via IntersectionObserver + CSS (see `[data-reveal]` in globals.css).
 * Server render has no `data-inview`, so content is visible without JS. After mount,
 * elements already on screen stay put; off-screen ones are hidden and fade in on
 * first intersection. Reduced motion: the CSS only applies under
 * `prefers-reduced-motion: no-preference`, so nothing is ever hidden.
 */
function Reveal({
  kind,
  className,
  style,
  children,
}: {
  kind: AnimationPreset | 'stagger';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState<boolean>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) observer.disconnect();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={kind} data-inview={inView} className={className} style={style}>
      {children}
    </div>
  );
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
  return (
    <Reveal
      kind={preset}
      className={className}
      style={{ '--reveal-delay': `${delay}s`, '--reveal-duration': `${duration}s` } as CSSProperties}
    >
      {children}
    </Reveal>
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
  return (
    <Reveal
      kind="stagger"
      className={className}
      style={{ '--stagger': `${staggerDelay}s` } as CSSProperties}
    >
      {children}
    </Reveal>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
