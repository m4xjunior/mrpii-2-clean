'use client';

import { FC } from 'react';
import CountUp from './CountUp';

interface KHMetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
}

export const KHMetricCard: FC<KHMetricCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend,
  trendValue,
  color = 'primary',
  delay = 0
}) => {
  const colorClasses = {
    primary: 'border-red-200 bg-red-50 hover:bg-red-100',
    success: 'border-green-200 bg-green-50 hover:bg-green-100',
    warning: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
    danger: 'border-red-200 bg-red-50 hover:bg-red-100'
  };

  const iconColors = {
    primary: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className={`text-2xl ${iconColors[color]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <CountUp
          to={value}
          duration={2}
          delay={delay}
          className="text-3xl font-bold text-gray-900"
          separator="."
        />
        {unit && (
          <span className="text-lg text-gray-500 font-medium">
            {unit}
          </span>
        )}
      </div>

      {trend && trendValue !== undefined && (
        <div className="flex items-center mt-3 text-sm">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-800' :
            trend === 'down' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            {Math.abs(trendValue)}%
          </span>
        </div>
      )}
    </div>
  );
};




