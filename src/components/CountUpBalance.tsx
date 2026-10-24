import React, { useState, useEffect, useRef } from 'react';
import { formatCurrencyValue } from '../data/tasksData';
import { Sparkles, TrendingUp } from 'lucide-react';

interface CountUpBalanceProps {
  amountCfa: number;
  currencySymbol?: string;
  currencyRate?: number;
  durationMs?: number;
  className?: string;
  showFloatingBadge?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const CountUpBalance: React.FC<CountUpBalanceProps> = ({
  amountCfa,
  currencySymbol = 'F CFA',
  currencyRate = 1,
  durationMs = 1200,
  className = '',
  showFloatingBadge = true,
  size = 'hero',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(amountCfa);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [floatingDelta, setFloatingDelta] = useState<number | null>(null);
  const [badgeKey, setBadgeKey] = useState<number>(0);

  const prevAmountRef = useRef<number>(amountCfa);
  const animationFrameRef = useRef<number | null>(null);
  const badgeTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const prevAmount = prevAmountRef.current;
    
    // Trigger count-up animation only when the balance strictly increases
    if (amountCfa > prevAmount) {
      const delta = amountCfa - prevAmount;
      setFloatingDelta(delta);
      setBadgeKey(prev => prev + 1);
      setIsCounting(true);

      const startTime = performance.now();
      const startVal = prevAmount;
      const targetVal = amountCfa;

      // Quartic ease-out curve for natural, satisfying deceleration
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const easedProgress = easeOutQuart(progress);
        
        const currentVal = startVal + (targetVal - startVal) * easedProgress;
        setDisplayValue(currentVal);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(targetVal);
          setIsCounting(false);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(step);

      // Auto-hide floating notification badge after animation ends
      if (badgeTimeoutRef.current) {
        clearTimeout(badgeTimeoutRef.current);
      }
      badgeTimeoutRef.current = setTimeout(() => {
        setFloatingDelta(null);
      }, durationMs + 1800);

    } else if (amountCfa < prevAmount) {
      // Immediate update on balance deduction (withdrawal)
      setDisplayValue(amountCfa);
      setIsCounting(false);
    }

    prevAmountRef.current = amountCfa;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (badgeTimeoutRef.current) {
        clearTimeout(badgeTimeoutRef.current);
      }
    };
  }, [amountCfa, durationMs]);

  // Format the current interpolated animated value
  const formattedText = formatCurrencyValue(
    Math.round(displayValue),
    currencySymbol,
    currencyRate
  );

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Animated Numerical Balance Value */}
      <span
        className={`font-display font-black tracking-tight transition-transform duration-300 ${
          isCounting
            ? 'scale-[1.04] text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]'
            : ''
        }`}
      >
        {formattedText}
      </span>

      {/* Gratifying Floating Gain Badge when task completed (+X F CFA) */}
      {showFloatingBadge && floatingDelta !== null && (
        <span
          key={badgeKey}
          className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#9f1239] font-black text-[11px] sm:text-xs shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-rose-200 pointer-events-none animate-floatUp whitespace-nowrap z-30"
          style={{
            animation: 'floatUpGain 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
          <span>+{formatCurrencyValue(floatingDelta, currencySymbol, currencyRate)}</span>
        </span>
      )}
    </span>
  );
};
