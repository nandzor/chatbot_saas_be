/**
 * Safe Avatar component with automatic fallback handling
 */
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { useImageFallback } from '@/hooks/useImageFallback';
import { getInitials } from '@/utils/avatarUtils';

const SafeAvatar = ({ 
  src, 
  name = '', 
  className = '', 
  size = 'default',
  fallbackBgColor = '2563EB',
  fallbackTextColor = 'FFFFFF',
  ...props 
}) => {
  const initials = getInitials(name);
  const { src: safeSrc, isLoading, hasError } = useImageFallback(
    src, 
    initials, 
    fallbackBgColor, 
    fallbackTextColor
  );

  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  return (
    <Avatar className={`${sizeClasses[size] || sizeClasses.default} ${className}`} {...props}>
      {!isLoading && (
        <AvatarImage 
          src={safeSrc} 
          alt={name || 'Avatar'}
          onError={(e) => {
            console.warn('Avatar image failed to load:', e.target.src);
          }}
        />
      )}
      <AvatarFallback className="bg-blue-600 text-white font-semibold">
        {isLoading ? '...' : initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default SafeAvatar;
