import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * FormSection Component
 * Organizes form fields into logical sections with consistent styling
 */
export const FormSection = ({
  // Section configuration
  title,
  description,
  icon: Icon,

  // Layout
  children,
  className = '',

  // Styling
  variant = 'default',
  size = 'default',
  collapsible = false,
  defaultCollapsed = false,

  // Actions
  actions,

  // State
  loading = false,
  error = null,

  // Custom renderer
  render
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      title: 'text-lg',
      description: 'text-sm'
    },
    default: {
      padding: 'p-6',
      title: 'text-xl',
      description: 'text-sm'
    },
    lg: {
      padding: 'p-8',
      title: 'text-2xl',
      description: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      header: 'border-b border-gray-200 bg-gray-50',
      content: 'bg-white'
    },
    elevated: {
      container: 'bg-white border border-gray-300 rounded-lg shadow-md',
      header: 'border-b border-gray-300 bg-gray-100',
      content: 'bg-white'
    },
    minimal: {
      container: 'bg-transparent border-0 shadow-none',
      header: 'border-b border-gray-200 bg-transparent',
      content: 'bg-transparent'
    },
    outlined: {
      container: 'bg-white border-2 border-gray-200 rounded-lg',
      header: 'border-b-2 border-gray-200 bg-gray-50',
      content: 'bg-white'
    }
  };

  const variantStyles = variantConfig[variant];

  // Custom renderer takes precedence
  if (render) {
    return render({ children, title, description, loading, error });
  }

  // Loading state
  if (loading) {
    return (
      <Card className={cn(variantStyles.container, className)}>
        <CardHeader className={cn(variantStyles.header, config.padding)}>
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-5 h-5 text-gray-400 animate-pulse" />}
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              {description && (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn(variantStyles.content, config.padding)}>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn(variantStyles.container, 'border-red-200', className)}>
        <CardHeader className={cn(variantStyles.header, 'border-red-200 bg-red-50', config.padding)}>
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-5 h-5 text-red-500" />}
            <div>
              <CardTitle className={cn(config.title, 'text-red-900')}>
                {title || 'Error'}
              </CardTitle>
              {description && (
                <p className={cn(config.description, 'text-red-700 mt-1')}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn(variantStyles.content, config.padding)}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default render
  return (
    <Card className={cn(variantStyles.container, className)}>
      {(title || description || Icon || actions) && (
        <CardHeader className={cn(variantStyles.header, config.padding)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="w-5 h-5 text-gray-500" />}
              <div>
                {title && (
                  <CardTitle className={cn(config.title, 'text-gray-900')}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <p className={cn(config.description, 'text-gray-600 mt-1')}>
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(variantStyles.content, config.padding)}>
        <div className="space-y-6">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormSection;
