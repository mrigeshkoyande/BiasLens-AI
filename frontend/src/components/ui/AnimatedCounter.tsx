'use client';
import { CSSProperties, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: CSSProperties;
}

export default function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = value * eased;
      if (ref.current) {
        ref.current.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      }
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}0{suffix}
    </span>
  );
}
