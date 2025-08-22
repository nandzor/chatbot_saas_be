import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UserAvatar from '@/components/common/UserAvatar';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui';
import { 
  User,
  LogOut,
  Settings,
  Shield,
  Users,
  UserCheck,
  ChevronDown
} from 'lucide-react';

const UserProfile = ({ showFullProfile = false }) => {
  const { user, logout, isRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role) {
      case 'superadmin':
        return <Shield className="w-4 h-4" />;
      case 'organization_admin':
        return <Users className="w-4 h-4" />;
      case 'agent':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'superadmin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'organization_admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'agent':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'superadmin':
        return 'Super Admin';
      case 'organization_admin':
        return 'Organization Admin';
      case 'agent':
        return 'Agent';
      default:
        return user.role;
    }
  };

  const getInitials = () => {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Add a small delay to close dropdown before logout
    setTimeout(() => {
      if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        logout();
      }
    }, 100);
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
    
    // Navigate based on user role
    switch (user.role) {
      case 'superadmin':
        // For superadmin, you might want to navigate to a different profile page
        // or keep them in the current context
        break;
      case 'organization_admin':
        navigate('/dashboard/profile');
        break;
      case 'agent':
        navigate('/agent/profile');
        break;
      default:
        // Default navigation
        break;
    }
  };

  if (showFullProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="xl" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {getRoleIcon()}
                <Badge className={getRoleColor()}>
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>
          </div>

          {user.organizationName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Organization</p>
              <p className="text-muted-foreground">{user.organizationName}</p>
            </div>
          )}

          {user.specialization && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Specialization</p>
              <p className="text-muted-foreground">{user.specialization}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Permissions</p>
            <div className="flex flex-wrap gap-1">
              {user.permissions?.map((permission, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {permission === '*' ? 'All Permissions' : permission}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact dropdown version for header
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
          <UserAvatar user={user} size="default" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled>
          <div className="flex items-center gap-2">
            {getRoleIcon()}
            <span>{getRoleLabel()}</span>
          </div>
        </DropdownMenuItem>

        {user.organizationName && (
          <DropdownMenuItem disabled>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Organization</span>
              <span className="text-sm">{user.organizationName}</span>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfileSettings}>
          <Settings className="w-4 h-4 mr-2" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
