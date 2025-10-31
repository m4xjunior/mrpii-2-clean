'use client';

import { useState, useEffect } from 'react';

export type LayoutType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveConfig {
  mobile: { maxWidth: number };
  tablet: { minWidth: number; maxWidth: number };
  desktop: { minWidth: number };
}

const defaultConfig: ResponsiveConfig = {
  mobile: { maxWidth: 768 },
  tablet: { minWidth: 769, maxWidth: 1024 },
  desktop: { minWidth: 1025 }
};

export const useResponsiveLayout = (config: ResponsiveConfig = defaultConfig) => {
  const [layout, setLayout] = useState<LayoutType>('desktop');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });

      if (width <= config.mobile.maxWidth) {
        setLayout('mobile');
      } else if (width >= config.tablet.minWidth && width <= config.tablet.maxWidth) {
        setLayout('tablet');
      } else {
        setLayout('desktop');
      }
    };

    // Set initial layout
    updateLayout();

    // Add event listener
    window.addEventListener('resize', updateLayout);

    // Cleanup
    return () => window.removeEventListener('resize', updateLayout);
  }, [config]);

  const isMobile = layout === 'mobile';
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'desktop';

  // Responsive spacing helpers inspired by Context7
  const getSpacing = (mobile: number, tablet?: number, desktop?: number) => {
    switch (layout) {
      case 'mobile':
        return `${mobile}rem`;
      case 'tablet':
        return `${tablet || mobile * 1.2}rem`;
      case 'desktop':
        return `${desktop || mobile * 1.5}rem`;
      default:
        return `${mobile}rem`;
    }
  };

  const getFontSize = (mobile: number, tablet?: number, desktop?: number) => {
    switch (layout) {
      case 'mobile':
        return `${mobile}rem`;
      case 'tablet':
        return `${tablet || mobile * 1.1}rem`;
      case 'desktop':
        return `${desktop || mobile * 1.2}rem`;
      default:
        return `${mobile}rem`;
    }
  };

  const getBreakpointStyles = (styles: {
    mobile: React.CSSProperties;
    tablet?: React.CSSProperties;
    desktop?: React.CSSProperties;
  }): React.CSSProperties => {
    switch (layout) {
      case 'mobile':
        return styles.mobile;
      case 'tablet':
        return { ...styles.mobile, ...styles.tablet };
      case 'desktop':
        return { ...styles.mobile, ...styles.tablet, ...styles.desktop };
      default:
        return styles.mobile;
    }
  };

  const getGridCols = (mobile: number, tablet?: number, desktop?: number) => {
    switch (layout) {
      case 'mobile':
        return mobile;
      case 'tablet':
        return tablet || Math.min(mobile * 2, 6);
      case 'desktop':
        return desktop || Math.min(mobile * 3, 12);
      default:
        return mobile;
    }
  };

  return {
    layout,
    dimensions,
    isMobile,
    isTablet,
    isDesktop,
    getSpacing,
    getFontSize,
    getBreakpointStyles,
    getGridCols
  };
};

export default useResponsiveLayout;