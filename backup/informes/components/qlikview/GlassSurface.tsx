'use client';

import React from 'react';

interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  mixBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  className?: string;
  style?: React.CSSProperties;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = '100%',
  height = 'auto',
  borderRadius = 12,
  borderWidth = 1,
  brightness = 1,
  opacity = 1,
  blur = 20,
  displace = 20,
  backgroundOpacity = 0.1,
  saturation = 1,
  distortionScale = 0.5,
  redOffset = 0,
  greenOffset = 0,
  blueOffset = 0,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'normal',
  className = '',
  style = {},
}) => {
  const surfaceStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: `${borderRadius}px`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${brightness})`,
    background: `rgba(255, 255, 255, ${backgroundOpacity})`,
    border: `${borderWidth}px solid rgba(255, 255, 255, 0.2)`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={`glass-surface ${className}`} style={surfaceStyle}>
      {children}
    </div>
  );
};




