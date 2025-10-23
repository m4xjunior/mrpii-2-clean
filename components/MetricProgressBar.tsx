"use client";

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import CountUp from './CountUp';

interface MetricProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  height?: number;
  width?: number;
  animationDuration?: number;
  className?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const MetricProgressBar: React.FC<MetricProgressBarProps> = ({
  label,
  value,
  maxValue = 100,
  color,
  backgroundColor = 'rgba(108, 117, 125, 0.15)',
  showPercentage = true,
  showValue = true,
  height = 8,
  width = '100%',
  animationDuration = 1.5,
  className = '',
  icon,
  subtitle
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    // Animação suave do valor
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);

    // Animação da barra
    controls.start({
      width: `${Math.min((value / maxValue) * 100, 100)}%`,
      transition: {
        duration: animationDuration,
        ease: [0.4, 0, 0.2, 1],
        delay: 0.2
      }
    });

    return () => clearTimeout(timer);
  }, [value, maxValue, controls, animationDuration]);

  const progressPercentage = Math.min((animatedValue / maxValue) * 100, 100);

  return (
    <div
      className={`metric-progress-bar ${className}`}
      style={{
        width,
        position: 'relative'
      }}
    >
      {/* Header com label e valor */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {icon && (
            <div style={{
              fontSize: '12px',
              color: color,
              display: 'flex',
              alignItems: 'center'
            }}>
              {icon}
            </div>
          )}
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#495057',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}>
            {label}
          </span>
        </div>

        {showValue && (
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 800,
              color: color,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <CountUp
                to={animatedValue}
                decimals={1}
                duration={1}
              />
            </span>
            {showPercentage && (
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'uppercase'
              }}>
                %
              </span>
            )}
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        background: backgroundColor,
        borderRadius: `${height/2}px`,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Barra de progresso animada */}
        <motion.div
          initial={{ width: 0 }}
          animate={controls}
          style={{
            height: '100%',
            background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
            borderRadius: `${height/2}px`,
            position: 'relative',
            boxShadow: `0 0 0 1px ${adjustColor(color, 20)}`,
          }}
        >
          {/* Efeito de brilho */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '30%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              borderRadius: `${height/2}px`
            }}
          />
        </motion.div>

        {/* Marcadores de progresso */}
        {[25, 50, 75].map((marker) => (
          <div
            key={marker}
            style={{
              position: 'absolute',
              left: `${marker}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1px',
              height: '60%',
              background: 'rgba(255,255,255,0.4)',
              zIndex: 2,
              opacity: progressPercentage > marker ? 0 : 0.6
            }}
          />
        ))}
      </div>

      {/* Subtítulo opcional */}
      {subtitle && (
        <div style={{
          fontSize: '9px',
          fontWeight: 500,
          color: '#6c757d',
          textAlign: 'center',
          marginTop: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.2px'
        }}>
          {subtitle}
        </div>
      )}

      {/* Tooltip com valor completo */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
          marginBottom: '8px',
          whiteSpace: 'nowrap',
          zIndex: 1000
        }}
        className="metric-tooltip"
      >
        {label}: {animatedValue.toFixed(1)}{showPercentage ? '%' : ''}
      </div>
    </div>
  );
};

// Função auxiliar para ajustar cor (escurecer/clarear)
function adjustColor(color: string, amount: number): string {
  // Converte hex para RGB se necessário
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Ajusta cada componente
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  // Converte de volta para hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Estilos CSS adicionais
const styles = `
  .metric-progress-bar:hover .metric-tooltip {
    opacity: 1;
  }

  .metric-progress-bar:hover {
    transform: translateY(-1px);
    transition: transform 0.2s ease;
  }
`;

// Injeta estilos se não estiverem presentes
if (typeof document !== 'undefined') {
  const styleId = 'metric-progress-bar-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

export default MetricProgressBar;
