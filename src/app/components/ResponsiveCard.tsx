'use client';

import React, { CSSProperties, ReactNode } from 'react';
import {
  getProportionClasses,
  getPaddingClasses,
  CARD_PROPORTIONS,
  combineClasses,
} from '../../lib/design-system/proportions';

interface ResponsiveCardProps {
  /**
   * Tipo de proporção do card
   * - compact_mobile: 4:5 para mobile (compacto)
   * - compact_desktop: 8:11 para desktop (dourado modificado)
   * - widescreen: 16:9 para cards largos
   * - metric_square: 1:1 para quadrados de métrica
   */
  proportion?: keyof typeof CARD_PROPORTIONS;

  /**
   * Conteúdo do card
   */
  children: ReactNode;

  /**
   * Classes CSS customizadas adicionais
   */
  className?: string;

  /**
   * Estilos inline customizados
   */
  style?: CSSProperties;

  /**
   * Se deve aplicar sombra
   */
  shadow?: boolean;

  /**
   * Se deve aplicar borda
   */
  border?: boolean;

  /**
   * Cor de fundo
   */
  bgColor?: string;

  /**
   * Função de callback ao passar mouse
   */
  onHover?: (isHovering: boolean) => void;

  /**
   * Se deve aplicar animação de hover
   */
  interactive?: boolean;
}

/**
 * Componente ResponsiveCard
 * 
 * Card responsivo que mantém proporções ideais em todos os breakpoints.
 * Adapta padding, gap e dimensões baseado no tamanho da tela.
 * 
 * @example
 * ```tsx
 * <ResponsiveCard proportion="compact_mobile" shadow border>
 *   <div>Conteúdo do card</div>
 * </ResponsiveCard>
 * ```
 */
export default function ResponsiveCard({
  proportion = 'compact_mobile',
  children,
  className = '',
  style = {},
  shadow = true,
  border = true,
  bgColor = '#ffffff',
  onHover,
  interactive = true,
}: ResponsiveCardProps) {
  const proportionClass = getProportionClasses(proportion);
  const paddingClass = getPaddingClasses();

  const baseClasses = combineClasses(
    // Layout base
    'w-full',
    'rounded-lg',
    'transition-all',
    'duration-300',
    'ease-out',

    // Proporção
    proportionClass,

    // Padding responsivo
    paddingClass,

    // Aparência visual
    shadow && 'shadow-sm hover:shadow-md',
    border && 'border border-gray-200',

    // Hover interativo
    interactive && 'hover:scale-[1.02] hover:border-gray-300',

    // Classes customizadas
    className,
  );

  return (
    <div
      className={baseClasses}
      style={{
        backgroundColor: bgColor,
        ...style,
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveCardHeader
 * Componente para o header do card
 */
interface ResponsiveCardHeaderProps {
  children: ReactNode;
  className?: string;
  bgColor?: string;
}

export function ResponsiveCardHeader({
  children,
  className = '',
  bgColor = '#f9fafb',
}: ResponsiveCardHeaderProps) {
  return (
    <div
      className={combineClasses(
        'py-3 md:py-4 lg:py-5',
        'px-3 md:px-4 lg:px-6',
        'border-b border-gray-200',
        'font-semibold text-sm md:text-base',
        className,
      )}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveCardBody
 * Componente para o corpo do card
 */
interface ResponsiveCardBodyProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardBody({
  children,
  className = '',
}: ResponsiveCardBodyProps) {
  return (
    <div
      className={combineClasses(
        'py-3 md:py-4 lg:py-5',
        'px-3 md:px-4 lg:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveCardFooter
 * Componente para o footer do card
 */
interface ResponsiveCardFooterProps {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}

export function ResponsiveCardFooter({
  children,
  className = '',
  divider = true,
}: ResponsiveCardFooterProps) {
  return (
    <div
      className={combineClasses(
        'py-3 md:py-4 lg:py-5',
        'px-3 md:px-4 lg:px-6',
        divider && 'border-t border-gray-200',
        className,
      )}
    >
      {children}
    </div>
  );
}
