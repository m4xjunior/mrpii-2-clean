/**
 * Design System: Proportion Tokens & Utilities
 * Baseado em boas práticas de proporção de design responsivo
 * Proporções ideais: 8:11 (0.727), 4:5 (0.8), 16:9 (1.778), 1:1 (1.0)
 */

// Proporções ideais
export const PROPORTION_RATIOS = {
  GOLDEN_MODIFIED: 8 / 11, // 0.727 - Proporção dourada modificada, ideal para cards com teor médio
  COMPACT: 4 / 5, // 0.8 - Proporção clássica para componentes compactos e dados densos
  WIDESCREEN: 16 / 9, // 1.778 - Proporção cinematográfica para cards largo/informação extendida
  SQUARE: 1 / 1, // 1.0 - Quadrado para componentes isolados de métricas
} as const;

// Breakpoints Tailwind (em pixels)
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Espaçamento harmônico (escala de proporção áurea)
export const SPACING_SCALE = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
} as const;

// Altura de cards dinâmica por breakpoint
export const CARD_HEIGHT_BY_BREAKPOINT: Record<BreakpointKey, string> = {
  xs: 'min-h-72', // 288px
  sm: 'min-h-80', // 320px
  md: 'min-h-80', // 320px
  lg: 'min-h-96', // 384px
  xl: 'min-h-96', // 384px
  '2xl': 'min-h-screen', // 100vh em desktops largos
};

// Proporções de cards por tipo
export const CARD_PROPORTIONS = {
  compact_mobile: PROPORTION_RATIOS.COMPACT, // 4:5 para mobile
  compact_desktop: PROPORTION_RATIOS.GOLDEN_MODIFIED, // 8:11 para desktop
  widescreen: PROPORTION_RATIOS.WIDESCREEN, // 16:9 para cards largos
  metric_square: PROPORTION_RATIOS.SQUARE, // 1:1 para quadrados de métrica
} as const;

// Classes Tailwind por proporção
export const ASPECT_RATIO_CLASSES = {
  '8/11': 'aspect-[8/11]',
  '4/5': 'aspect-[4/5]',
  '16/9': 'aspect-[16/9]',
  '1/1': 'aspect-square',
} as const;

// Dimensões de quadrados de métrica por breakpoint
export const METRIC_SQUARE_DIMENSIONS: Record<BreakpointKey, { width: string; height: string }> = {
  xs: { width: 'w-14', height: 'h-20' }, // 56px x 80px
  sm: { width: 'w-16', height: 'h-24' }, // 64px x 96px
  md: { width: 'w-16', height: 'h-24' }, // 64px x 96px
  lg: { width: 'w-20', height: 'h-32' }, // 80px x 128px
  xl: { width: 'w-24', height: 'h-40' }, // 96px x 160px
  '2xl': { width: 'w-28', height: 'h-48' }, // 112px x 192px
};

// Padding responsivo (12px → 16px → 20px → 24px)
export const PADDING_RESPONSIVE: Record<BreakpointKey, { x: string; y: string }> = {
  xs: { x: 'px-3', y: 'py-2' }, // 12px / 8px
  sm: { x: 'px-3', y: 'py-2' }, // 12px / 8px
  md: { x: 'px-4', y: 'py-3' }, // 16px / 12px
  lg: { x: 'px-5', y: 'py-4' }, // 20px / 16px
  xl: { x: 'px-6', y: 'py-5' }, // 24px / 20px
  '2xl': { x: 'px-8', y: 'py-6' }, // 32px / 24px
};

// Gap entre cards (12px → 16px → 20px)
export const GAP_RESPONSIVE: Record<BreakpointKey, string> = {
  xs: 'gap-3', // 12px
  sm: 'gap-3', // 12px
  md: 'gap-4', // 16px
  lg: 'gap-5', // 20px
  xl: 'gap-6', // 24px
  '2xl': 'gap-8', // 32px
};

// Colunas de grid por breakpoint (para cards de máquinas)
export const GRID_COLUMNS_BY_BREAKPOINT: Record<BreakpointKey, string> = {
  xs: 'grid-cols-1', // 1 coluna em mobile extra-pequeno
  sm: 'grid-cols-1 sm:grid-cols-2', // 1-2 colunas
  md: 'grid-cols-2 md:grid-cols-3', // 2-3 colunas
  lg: 'grid-cols-3 lg:grid-cols-4', // 3-4 colunas
  xl: 'grid-cols-4 xl:grid-cols-5', // 4-5 colunas
  '2xl': 'grid-cols-5 2xl:grid-cols-6', // 5-6 colunas
};

/**
 * Funções utilitárias
 */

/**
 * Calcula a altura necessária para manter uma proporção específica
 * @param width Largura em pixels
 * @param ratio Proporção (altura/largura)
 * @returns Altura em pixels
 */
export function calculateHeightFromRatio(width: number, ratio: number): number {
  return width * ratio;
}

/**
 * Calcula a largura necessária para manter uma proporção específica
 * @param height Altura em pixels
 * @param ratio Proporção (altura/largura)
 * @returns Largura em pixels
 */
export function calculateWidthFromRatio(height: number, ratio: number): number {
  return height / ratio;
}

/**
 * Retorna as classes Tailwind para um card responsivo
 * @param proportion Tipo de proporção desejada
 * @returns String com classes Tailwind
 */
export function getProportionClasses(proportion: keyof typeof CARD_PROPORTIONS): string {
  switch (proportion) {
    case 'compact_mobile':
      return ASPECT_RATIO_CLASSES['4/5'];
    case 'compact_desktop':
      return ASPECT_RATIO_CLASSES['8/11'];
    case 'widescreen':
      return ASPECT_RATIO_CLASSES['16/9'];
    case 'metric_square':
      return ASPECT_RATIO_CLASSES['1/1'];
    default:
      return ASPECT_RATIO_CLASSES['4/5'];
  }
}

/**
 * Retorna as classes de padding responsivo concatenadas
 * @param breakpoint Breakpoint específico ou undefined para gerar para todos
 * @returns String com classes Tailwind responsivas
 */
export function getPaddingClasses(breakpoint?: BreakpointKey): string {
  if (breakpoint) {
    const padding = PADDING_RESPONSIVE[breakpoint];
    return `${padding.x} ${padding.y}`;
  }

  // Gera classes responsivas para todos os breakpoints
  const classes = [
    PADDING_RESPONSIVE.xs.x,
    PADDING_RESPONSIVE.xs.y,
    `sm:${PADDING_RESPONSIVE.sm.x}`,
    `sm:${PADDING_RESPONSIVE.sm.y}`,
    `md:${PADDING_RESPONSIVE.md.x}`,
    `md:${PADDING_RESPONSIVE.md.y}`,
    `lg:${PADDING_RESPONSIVE.lg.x}`,
    `lg:${PADDING_RESPONSIVE.lg.y}`,
    `xl:${PADDING_RESPONSIVE.xl.x}`,
    `xl:${PADDING_RESPONSIVE.xl.y}`,
    `2xl:${PADDING_RESPONSIVE['2xl'].x}`,
    `2xl:${PADDING_RESPONSIVE['2xl'].y}`,
  ];

  return classes.join(' ');
}

/**
 * Retorna as classes de gap responsivo concatenadas
 * @returns String com classes Tailwind responsivas
 */
export function getGapClasses(): string {
  const classes = [
    GAP_RESPONSIVE.xs,
    `sm:${GAP_RESPONSIVE.sm}`,
    `md:${GAP_RESPONSIVE.md}`,
    `lg:${GAP_RESPONSIVE.lg}`,
    `xl:${GAP_RESPONSIVE.xl}`,
    `2xl:${GAP_RESPONSIVE['2xl']}`,
  ];

  return classes.join(' ');
}

/**
 * Retorna as classes de dimensões de quadrado de métrica responsivo
 * @returns String com classes Tailwind responsivas
 */
export function getMetricSquareClasses(): string {
  const dimensions = METRIC_SQUARE_DIMENSIONS;
  const classes = [
    dimensions.xs.width,
    dimensions.xs.height,
    `sm:${dimensions.sm.width}`,
    `sm:${dimensions.sm.height}`,
    `md:${dimensions.md.width}`,
    `md:${dimensions.md.height}`,
    `lg:${dimensions.lg.width}`,
    `lg:${dimensions.lg.height}`,
    `xl:${dimensions.xl.width}`,
    `xl:${dimensions.xl.height}`,
    `2xl:${dimensions['2xl'].width}`,
    `2xl:${dimensions['2xl'].height}`,
  ];

  return classes.join(' ');
}

/**
 * Retorna as classes de grid responsivo para cards
 * @returns String com classes Tailwind responsivas
 */
export function getGridColumnsClasses(): string {
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
}

/**
 * Combina múltiplas classes de forma segura
 * @param classes Classes a combinar
 * @returns String com classes filtradas e combinadas
 */
export function combineClasses(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((cls): cls is string => Boolean(cls))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
