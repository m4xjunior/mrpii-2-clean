// Componentes ReactBits simplificados para a página de informes
import React, { ReactNode } from 'react';

// Animated Content - para animações de entrada
interface AnimatedContentProps {
  children: ReactNode;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  delay?: number;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const axis = direction === 'horizontal' ? 'x' : 'y';
  const offset = reverse ? -distance : distance;

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0'
      }`}
      style={{
        transitionDuration: `${duration}s`,
        transform: isVisible
          ? 'translate(0, 0)'
          : axis === 'x' ? `translateX(${offset}px)` : `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
};

// CountUp - animação de números
interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const CountUpNumber: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 2000,
  className = '',
  suffix = '',
  prefix = ''
}) => {
  // Ensure values are numbers
  const validTo = typeof to === 'number' && !isNaN(to) ? to : 0;
  const validFrom = typeof from === 'number' && !isNaN(from) ? from : 0;
  
  const [current, setCurrent] = React.useState(validFrom);
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(validFrom + (validTo - validFrom) * easeOutQuart);

      setCurrent(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, validFrom, validTo, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  );
};

// Fundo animado simples - REMOVIDO PARA EVITAR PROBLEMA DE COR VERDE
export const AnimatedBackground: React.FC = () => {
  return null; // Desabilitado para evitar overlay verde
};
