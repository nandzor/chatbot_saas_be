// Avatar utility functions

/**
 * Generate avatar URL from various services
 */
export const generateAvatarUrl = (name, email, size = 40) => {
  // Primary: Use Dicebear API (reliable avatar generation)
  const seed = email || name;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
};

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate background color based on name
 */
export const getAvatarBackgroundColor = (name) => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500'
  ];
  
  // Generate consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Avatar data for different users
 */
export const avatarData = {
  // Super Admin
  'superadmin@system.com': {
    name: 'Super Administrator',
    color: 'bg-red-500',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin&backgroundColor=b91c1c'
  },
  
  // Organization Admin
  'ahmad.rahman@company.com': {
    name: 'Ahmad Rahman',
    color: 'bg-blue-500', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad&backgroundColor=3b82f6'
  },
  
  // Agents
  'sari.dewi@company.com': {
    name: 'Sari Dewi',
    color: 'bg-green-500',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sari&backgroundColor=10b981'
  },
  
  'budi.santoso@company.com': {
    name: 'Budi Santoso', 
    color: 'bg-purple-500',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi&backgroundColor=8b5cf6'
  },
  
  'rina.sari@company.com': {
    name: 'Rina Sari',
    color: 'bg-pink-500',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rina&backgroundColor=ec4899'
  },
  
  // Additional users
  'john.smith@platform.com': {
    name: 'John Smith',
    color: 'bg-indigo-500',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john&backgroundColor=6366f1'
  },
  
  'sarah.johnson@platform.com': {
    name: 'Sarah Johnson',
    color: 'bg-orange-500', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=f97316'
  }
};

/**
 * Get avatar data for a user
 */
export const getUserAvatarData = (email, name) => {
  const userData = avatarData[email];
  
  if (userData) {
    return userData;
  }
  
  // Generate avatar for unknown users
  return {
    name: name || 'User',
    color: getAvatarBackgroundColor(name || email || 'User'),
    avatar: generateAvatarUrl(name, email)
  };
};
