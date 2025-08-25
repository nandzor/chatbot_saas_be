import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

export const StatisticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  trendDirection = 'up', // 'up', 'down', 'neutral'
  variant = 'default', // 'default', 'success', 'warning', 'danger', 'info'
  size = 'default', // 'sm', 'default', 'lg'
  className = '',
  children,
  ...props
}) => {
  const variantConfig = {
    default: {
      card: 'bg-white border-gray-200',
      icon: 'text-gray-600 bg-gray-100',
      title: 'text-gray-600',
      value: 'text-gray-900',
      subtitle: 'text-gray-500',
      trend: {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600'
      }
    },
    success: {
      card: 'bg-green-50 border-green-200',
      icon: 'text-green-600 bg-green-100',
      title: 'text-green-700',
      value: 'text-green-900',
      subtitle: 'text-green-600',
      trend: {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-green-600'
      }
    },
    warning: {
      card: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600 bg-yellow-100',
      title: 'text-yellow-700',
      value: 'text-yellow-900',
      subtitle: 'text-yellow-600',
      trend: {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-yellow-600'
      }
    },
    danger: {
      card: 'bg-red-50 border-red-200',
      icon: 'text-red-600 bg-red-100',
      title: 'text-red-700',
      value: 'text-red-900',
      subtitle: 'text-red-600',
      trend: {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-red-600'
      }
    },
    info: {
      card: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600 bg-blue-100',
      title: 'text-blue-700',
      value: 'text-blue-900',
      subtitle: 'text-blue-600',
      trend: {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-blue-600'
      }
    }
  };

  const sizeConfig = {
    sm: {
      card: 'p-4',
      icon: 'w-8 h-8',
      title: 'text-sm',
      value: 'text-lg font-semibold',
      subtitle: 'text-xs'
    },
    default: {
      card: 'p-6',
      icon: 'w-10 h-10',
      title: 'text-sm',
      value: 'text-2xl font-bold',
      subtitle: 'text-sm'
    },
    lg: {
      card: 'p-8',
      icon: 'w-12 h-12',
      title: 'text-base',
      value: 'text-3xl font-bold',
      subtitle: 'text-base'
    }
  };

  const config = variantConfig[variant];
  const sizeStyle = sizeConfig[size];

  const renderTrend = () => {
    if (!trend) return null;

    const trendIcon = trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→';
    const trendClass = config.trend[trendDirection];

    return (
      <div className={cn('flex items-center space-x-1', trendClass)}>
        <span className="text-xs font-medium">{trendIcon}</span>
        <span className="text-xs font-medium">{trendValue}</span>
      </div>
    );
  };

  return (
    <Card className={cn(
      'border shadow-sm hover:shadow-md transition-shadow duration-200',
      config.card,
      sizeStyle.card,
      className
    )} {...props}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className={cn(
                  'flex items-center justify-center rounded-lg',
                  config.icon,
                  sizeStyle.icon
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <h3 className={cn('font-medium', config.title, sizeStyle.title)}>
                  {title}
                </h3>
                <div className="flex items-baseline space-x-2">
                  <p className={cn(config.value, sizeStyle.value)}>
                    {value}
                  </p>
                  {renderTrend()}
                </div>
                {subtitle && (
                  <p className={cn('mt-1', config.subtitle, sizeStyle.subtitle)}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          {children && (
            <div className="ml-4">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
