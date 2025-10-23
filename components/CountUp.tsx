"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  to: number;
  decimals?: number;
  duration?: number;
  separator?: string;
}

export default function CountUp({ 
  to, 
  decimals = 0, 
  duration = 1, 
  separator = "" 
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    // Clean up previous animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // If the value hasn't changed, don't animate
    if (to === countRef.current) return;

    // Store the current count as start value
    startValueRef.current = count;
    countRef.current = to;

    const startTime = performance.now();
    const startValue = startValueRef.current;
    const endValue = to;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      setCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        animationRef.current = undefined;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [to, duration]);

  // Format the number with decimals and separator
  const formatNumber = (num: number): string => {
    // Ensure num is a valid number
    const validNum = typeof num === 'number' && !isNaN(num) ? num : 0;
    const fixedNum = validNum.toFixed(decimals);
    
    if (!separator) return fixedNum;
    
    const parts = fixedNum.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return parts.join('.');
  };

  return <span>{formatNumber(count)}</span>;
}
