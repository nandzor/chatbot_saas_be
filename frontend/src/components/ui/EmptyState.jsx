import { Button } from './index';
import { cn } from '@/lib/utils';

export const EmptyState = ({
  icon: Icon,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  actionText,
  onAction,
  actionVariant = 'default',
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'py-8',
    default: 'py-12',
    lg: 'py-16'
  };

  const iconSizes = {
    sm: 'w-12 h-12',
    default: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const titleSizes = {
    sm: 'text-lg',
    default: 'text-xl',
    lg: 'text-2xl'
  };

  const descriptionSizes = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn(
      'text-center',
      sizeClasses[size],
      className
    )}>
      {Icon && (
        <div className="mx-auto mb-4 text-gray-400">
          <Icon className={cn('mx-auto', iconSizes[size])} />
        </div>
      )}

      <h3 className={cn(
        'font-semibold text-gray-900 mb-2',
        titleSizes[size]
      )}>
        {title}
      </h3>

      <p className={cn(
        'text-gray-600 max-w-sm mx-auto',
        descriptionSizes[size]
      )}>
        {description}
      </p>

      {actionText && onAction && (
        <div className="mt-6">
          <Button
            variant={actionVariant}
            onClick={onAction}
            size={size}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export const EmptyStateWithAction = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
  size = 'default'
}) => {
  return (
    <div className={cn(
      'text-center py-12',
      className
    )}>
      {Icon && (
        <div className="mx-auto mb-4 text-gray-400">
          <Icon className="w-16 h-16 mx-auto" />
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 max-w-sm mx-auto mb-6">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            onClick={primaryAction.onClick}
            size={size}
          >
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
            {primaryAction.text}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || 'outline'}
            onClick={secondaryAction.onClick}
            size={size}
          >
            {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
            {secondaryAction.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
