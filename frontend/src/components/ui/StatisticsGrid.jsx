import React from 'react';
import { cn } from '@/lib/utils';

export const StatisticsGrid = ({
  children,
  columns = 4,
  gap = 6,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapSizes = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      gridCols[columns] || gridCols[4],
      gapSizes[gap] || gapSizes[6],
      className
    )}>
      {children}
    </div>
  );
};

export const StatisticsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  trendDirection = 'up',
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const iconVariants = {
    default: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-purple-100 text-purple-600'
  };

  const sizeStyles = {
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const valueSizes = {
    sm: 'text-xl',
    default: 'text-2xl',
    lg: 'text-3xl'
  };

  const titleSizes = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base'
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trendDirection === 'down') {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return null;
  };

  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-600';
    if (trendDirection === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={cn(
      'border rounded-lg bg-white',
      sizeStyles[size],
      className
    )}>
      <div className="flex items-center">
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            iconVariants[variant]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className={cn('ml-4', Icon ? 'ml-4' : 'ml-0')}>
          <p className={cn(
            'font-medium text-gray-600',
            titleSizes[size]
          )}>
            {title}
          </p>

          <p className={cn(
            'font-bold text-gray-900',
            valueSizes[size]
          )}>
            {value}
          </p>

          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}

          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2',
              getTrendColor()
            )}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {trendValue}
              </span>
              <span className="text-xs">
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsGrid;
