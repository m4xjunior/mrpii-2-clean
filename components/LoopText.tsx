"use client";

import React, { useEffect, useRef, useState } from 'react';

interface LoopTextProps {
  text: string;
  speed?: number; // Velocidade do loop (default: 1.5)
  className?: string;
  gap?: number; // Espaçamento entre repetições (em pixels)
}

/**
 * Componente de texto em loop horizontal infinito
 * Similar ao Curved Loop do ReactBits mas sem curva
 */
export default function LoopText({
  text,
  speed = 1.5,
  className = '',
  gap = 20
}: LoopTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [animationId, setAnimationId] = useState('');

  useEffect(() => {
    // Gerar ID único para a animação
    const id = `loopText-${Math.random().toString(36).substr(2, 9)}`;
    setAnimationId(id);

    if (!containerRef.current || !innerRef.current) return;

    const inner = innerRef.current;

    // Aguardar o próximo frame para calcular larguras corretamente
    requestAnimationFrame(() => {
      if (!inner.firstElementChild) return;

      const textWidth = (inner.firstElementChild as HTMLElement).offsetWidth;
      const totalWidth = textWidth + gap;

      // Criar elemento de style para a animação
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ${id} {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${totalWidth}px);
          }
        }
      `;

      document.head.appendChild(style);
      inner.style.animation = `${id} ${speed}s linear infinite`;

      return () => {
        style.remove();
      };
    });
  }, [text, speed, gap]);

  return (
    <div
      ref={containerRef}
      className={`loop-text-container ${className}`}
      style={{
        display: 'inline-flex',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        width: '100%',
        position: 'relative'
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          willChange: 'transform'
        }}
      >
        <span style={{ display: 'inline-block', paddingRight: `${gap}px` }}>
          {text}
        </span>
        <span style={{ display: 'inline-block', paddingRight: `${gap}px` }}>
          {text}
        </span>
        <span style={{ display: 'inline-block', paddingRight: `${gap}px` }}>
          {text}
        </span>
      </div>
    </div>
  );
}
