'use client';

import React, { useState, useEffect } from 'react';

interface ProductionCounterProps {
  targetValue: number;
  duration?: number; // en milisegundos
  label: string;
  showIncrement?: boolean;
  className?: string;
}

export default function ProductionCounter({
  targetValue,
  duration = 2000,
  label,
  showIncrement = true,
  className = ''
}: ProductionCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (targetValue > 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentValue(0);

      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function para animación suave
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

        setCurrentValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [targetValue, duration, isAnimating]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  const increment = targetValue - currentValue;

  return (
    <div className={`production-counter ${className}`}>
      <div className="counter-container">
        <div className="counter-value">
          {showIncrement && increment > 0 && (
            <span className="counter-increment text-success">
              +{formatNumber(increment)}
            </span>
          )}
          <span className="counter-main">
            {formatNumber(currentValue)}
          </span>
        </div>
        <div className="counter-label">
          {label}
        </div>
      </div>

      <style jsx>{`
        .production-counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          min-height: 120px;
          position: relative;
          overflow: hidden;
        }

        .production-counter::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .counter-container {
          text-align: center;
          z-index: 1;
        }

        .counter-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .counter-increment {
          font-size: 1rem;
          font-weight: 500;
          opacity: 0.9;
          animation: pulse 1s ease-in-out infinite alternate;
        }

        .counter-main {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .counter-label {
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: 0.5rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .production-counter {
            min-height: 100px;
            padding: 0.75rem;
          }

          .counter-main {
            font-size: 2rem;
          }

          .counter-increment {
            font-size: 0.875rem;
          }

          .counter-label {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .production-counter {
            min-height: 90px;
            padding: 0.5rem;
          }

          .counter-main {
            font-size: 1.75rem;
          }

          .counter-increment {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
