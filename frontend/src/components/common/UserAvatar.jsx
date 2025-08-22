import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { getUserAvatarData, getInitials } from '@/utils/avatarUtils';

const UserAvatar = ({ 
  user, 
  name, 
  email, 
  size = 'default',
  className = '',
  showOnlineStatus = false,
  status = 'offline'
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Get user data
  const userName = user?.name || name || 'User';
  const userEmail = user?.email || email || '';
  const avatarData = getUserAvatarData(userEmail, userName);
  
  // Size variants
  const sizeClasses = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  // Status dot sizes
  const statusSizes = {
    sm: 'w-1.5 h-1.5',
    default: 'w-2 h-2',
    md: 'w-2.5 h-2.5', 
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };
  
  const getStatusColor = (userStatus) => {
    switch (userStatus) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={sizeClasses[size]}>
        {!imageError && (user?.avatar || avatarData.avatar) ? (
          <AvatarImage 
            src={user?.avatar || avatarData.avatar}
            alt={userName}
            onError={handleImageError}
          />
        ) : null}
        <AvatarFallback className={`${avatarData.color} text-white font-semibold`}>
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} ${getStatusColor(user?.status || status)} rounded-full border-2 border-white`} />
      )}
    </div>
  );
};

export default UserAvatar;
