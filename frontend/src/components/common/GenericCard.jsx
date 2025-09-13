/**
 * Generic Card Component
 * Reusable card component dengan berbagai konfigurasi
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Download,
  Share,
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  Database,
  Server,
  Activity,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Target,
  Award,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  RefreshCw,
  Loader2
} from 'lucide-react';

/**
 * Generic Card Component
 */
export const GenericCard = ({
  // Card content
  title = '',
  description = '',
  children,

  // Card type
  type = 'default', // default, info, success, warning, error, primary, secondary

  // Card size
  size = 'default', // sm, default, lg, xl

  // Card state
  loading = false,
  disabled = false,
  selected = false,

  // Card actions
  onEdit,
  onDelete,
  onView,
  onDownload,
  onShare,
  onLike,
  onDislike,
  onComment,
  onMore,
  actions = [],

  // Card metadata
  status,
  badge,
  tags = [],
  stats = [],

  // Card styling
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',

  // Card behavior
  clickable = false,
  onClick,
  onDoubleClick,

  // Card layout
  showHeader = true,
  showFooter = true,
  showActions = true,
  showStatus = true,
  showBadge = true,
  showTags = true,
  showStats = true,

  // Card icons
  icon,
  statusIcon,
  actionIcon,

  ...props
}) => {
  // Get card type classes
  const getTypeClasses = () => {
    const typeClasses = {
      default: 'border-border bg-card',
      info: 'border-blue-200 bg-blue-50',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50',
      primary: 'border-primary bg-primary/5',
      secondary: 'border-secondary bg-secondary/5'
    };
    return typeClasses[type] || typeClasses.default;
  };

  // Get card size classes
  const getSizeClasses = () => {
    const sizeClasses = {
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };
    return sizeClasses[size] || sizeClasses.default;
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      active: 'text-green-600',
      inactive: 'text-gray-600',
      pending: 'text-yellow-600',
      suspended: 'text-red-600',
      cancelled: 'text-red-600',
      expired: 'text-red-600',
      completed: 'text-green-600',
      failed: 'text-red-600',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    };
    return statusColors[status?.toLowerCase()] || 'text-gray-600';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusIcons = {
      active: CheckCircle,
      inactive: XCircle,
      pending: Clock,
      suspended: AlertTriangle,
      cancelled: XCircle,
      expired: AlertCircle,
      completed: CheckCircle,
      failed: XCircle,
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info
    };
    return statusIcons[status?.toLowerCase()] || Circle;
  };

  // Handle card click
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  // Handle card double click
  const handleDoubleClick = (e) => {
    if (disabled || loading) return;
    onDoubleClick?.(e);
  };

  // Render card header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <CardHeader className={headerClassName}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <CardTitle className="text-lg font-semibold truncate">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showStatus && status && (
              <div className="flex items-center space-x-1">
                {React.createElement(getStatusIcon(status), {
                  className: `w-4 h-4 ${getStatusColor(status)}`
                })}
                <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            )}

            {showBadge && badge && (
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            )}

            {showActions && (onMore || actions.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMore?.(e);
                }}
                className="h-8 w-8 p-0"
                disabled={disabled || loading}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {showTags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
    );
  };

  // Render card content
  const renderContent = () => {
    if (loading) {
      return (
        <CardContent className={contentClassName}>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    );
  };

  // Render card footer
  const renderFooter = () => {
    if (!showFooter) return null;

    const defaultActions = [
      onEdit && { icon: Edit, onClick: onEdit, label: 'Edit' },
      onView && { icon: Eye, onClick: onView, label: 'View' },
      onDownload && { icon: Download, onClick: onDownload, label: 'Download' },
      onShare && { icon: Share, onClick: onShare, label: 'Share' },
      onLike && { icon: Heart, onClick: onLike, label: 'Like' },
      onDislike && { icon: ThumbsDown, onClick: onDislike, label: 'Dislike' },
      onComment && { icon: MessageCircle, onClick: onComment, label: 'Comment' },
      onDelete && { icon: Trash2, onClick: onDelete, label: 'Delete' }
    ].filter(Boolean);

    const allActions = [...defaultActions, ...actions];

    if (allActions.length === 0 && !showStats) return null;

    return (
      <div className={`flex items-center justify-between w-full p-6 pt-0 ${footerClassName}`}>
        <div className="flex items-center justify-between w-full">
          {showStats && stats.length > 0 && (
            <div className="flex items-center space-x-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-1">
                  {stat.icon && (
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {stat.label}: {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {allActions.length > 0 && (
            <div className="flex items-center space-x-1">
              {allActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(e);
                  }}
                  className="h-8 w-8 p-0"
                  disabled={disabled || loading || action.disabled}
                  title={action.label}
                >
                  {action.icon}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`
        ${getTypeClasses()}
        ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${selected ? 'ring-2 ring-primary' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...props}
    >
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </Card>
  );
};

/**
 * Info Card
 */
export const InfoCard = ({
  title,
  description,
  children,
  icon,
  ...props
}) => {
  return (
    <GenericCard
      title={title}
      description={description}
      icon={icon}
      type="info"
      {...props}
    >
      {children}
    </GenericCard>
  );
};

/**
 * Success Card
 */
export const SuccessCard = ({
  title,
  description,
  children,
  icon,
  ...props
}) => {
  return (
    <GenericCard
      title={title}
      description={description}
      icon={icon}
      type="success"
      {...props}
    >
      {children}
    </GenericCard>
  );
};

/**
 * Warning Card
 */
export const WarningCard = ({
  title,
  description,
  children,
  icon,
  ...props
}) => {
  return (
    <GenericCard
      title={title}
      description={description}
      icon={icon}
      type="warning"
      {...props}
    >
      {children}
    </GenericCard>
  );
};

/**
 * Error Card
 */
export const ErrorCard = ({
  title,
  description,
  children,
  icon,
  ...props
}) => {
  return (
    <GenericCard
      title={title}
      description={description}
      icon={icon}
      type="error"
      {...props}
    >
      {children}
    </GenericCard>
  );
};

/**
 * Stats Card
 */
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon,
  ...props
}) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <GenericCard
      title={title}
      icon={icon}
      showFooter={false}
      {...props}
    >
      <div className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
    </GenericCard>
  );
};

/**
 * Loading Card
 */
export const LoadingCard = ({
  title = 'Loading...',
  description = 'Please wait while we load the data',
  ...props
}) => {
  return (
    <GenericCard
      title={title}
      description={description}
      loading={true}
      showFooter={false}
      {...props}
    />
  );
};

export default {
  GenericCard,
  InfoCard,
  SuccessCard,
  WarningCard,
  ErrorCard,
  StatsCard,
  LoadingCard
};
