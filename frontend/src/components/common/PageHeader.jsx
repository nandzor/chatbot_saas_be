import React from 'react';
import { Button, Badge, Separator } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * PageHeader Component
 * Provides consistent page headers with actions and metadata
 */
export const PageHeader = ({
  // Content
  title,
  subtitle,
  description,
  icon: Icon,

  // Actions
  primaryAction,
  secondaryActions = [],
  actions = [],

  // Metadata
  metadata = [],
  breadcrumbs = [],

  // Styling
  variant = 'default',
  size = 'default',

  // Layout
  className = '',

  // State
  loading = false,

  // Custom content
  children
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      title: 'text-xl',
      subtitle: 'text-sm',
      description: 'text-sm',
      icon: 'w-5 h-5',
      spacing: 'space-y-2'
    },
    default: {
      title: 'text-2xl',
      subtitle: 'text-base',
      description: 'text-sm',
      icon: 'w-6 h-6',
      spacing: 'space-y-3'
    },
    lg: {
      title: 'text-3xl',
      subtitle: 'text-lg',
      description: 'text-base',
      icon: 'w-8 h-8',
      spacing: 'space-y-4'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-white border-b border-gray-200',
      title: 'text-gray-900',
      subtitle: 'text-gray-600',
      description: 'text-gray-500'
    },
    elevated: {
      container: 'bg-white border-b border-gray-300 shadow-sm',
      title: 'text-gray-900',
      subtitle: 'text-gray-600',
      description: 'text-gray-500'
    },
    minimal: {
      container: 'bg-transparent border-0',
      title: 'text-gray-900',
      subtitle: 'text-gray-600',
      description: 'text-gray-500'
    }
  };

  const variantStyles = variantConfig[variant];

  // Loading state
  if (loading) {
    return (
      <div className={cn('px-6 py-4', variantStyles.container, className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && <div className={`${config.icon} bg-gray-200 rounded animate-pulse`} />}
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
              {subtitle && (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-9 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-9 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('px-6 py-4', variantStyles.container, className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`${config.icon} text-gray-500`}>
              <Icon />
            </div>
          )}
          <div className={cn(config.spacing)}>
            <div>
              <h1 className={cn(config.title, 'font-bold', variantStyles.title)}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(config.subtitle, variantStyles.subtitle)}>
                  {subtitle}
                </p>
              )}
            </div>
            {description && (
              <p className={cn(config.description, variantStyles.description)}>
                {description}
              </p>
            )}

            {/* Metadata */}
            {metadata.length > 0 && (
              <div className="flex items-center space-x-4 pt-2">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    {item.icon && <item.icon className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-gray-500">{item.label}</span>
                    {item.value && (
                      <>
                        <span className="text-gray-300">:</span>
                        <span className="text-sm font-medium text-gray-700">{item.value}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'sm'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}

          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'sm'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}

          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              size={primaryAction.size || 'sm'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {children && (
        <>
          <Separator className="my-4" />
          {children}
        </>
      )}
    </div>
  );
};

export default PageHeader;
