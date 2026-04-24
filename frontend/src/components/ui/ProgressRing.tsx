'use client';
import { useEffect, useRef } from 'react';

interface ProgressRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animate?: boolean;
}

function getRiskColor(score: number) {
  if (score >= 70) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.5)', label: 'Low Risk', labelColor: '#10b981' };
  if (score >= 40) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.5)', label: 'Medium Risk', labelColor: '#f59e0b' };
  return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.5)', label: 'High Risk', labelColor: '#ef4444' };
}

export default function ProgressRing({
  score,
  size = 180,
  strokeWidth = 12,
  showLabel = true,
  animate = true,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { stroke, glow, label, labelColor } = getRiskColor(score);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = `${circumference}`;
    const raf = requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
        circleRef.current.style.strokeDashoffset = `${offset}`;
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [score, circumference, offset, animate]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full opacity-20 animate-pulse"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        />

        <svg width={size} height={size} className="-rotate-90">
          {/* Gradient defs */}
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stroke} />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.6" />
            </linearGradient>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animate ? circumference : offset}
            strokeLinecap="round"
            filter="url(#ring-glow)"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedScore target={score} color={labelColor} />
          {showLabel && (
            <span className="text-[11px] font-medium mt-1" style={{ color: '#94a3b8' }}>
              Fairness Score
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div
          className="px-4 py-1.5 rounded-full text-[12px] font-bold border"
          style={{
            color: labelColor,
            borderColor: `${stroke}40`,
            background: `${stroke}15`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      if (ref.current) ref.current.textContent = String(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target]);

  return (
    <span
      ref={ref}
      className="text-[2.5rem] font-bold font-mono leading-none"
      style={{ color }}
    >
      0
    </span>
  );
}
