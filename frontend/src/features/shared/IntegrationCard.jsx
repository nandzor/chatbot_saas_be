import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge
} from '@/components/ui';
import { 
  Settings,
  Play,
  Pause,
  Sheet,
  MessageSquare,
  Truck,
  Bell,
  Shield,
  Zap,
  Users,
  CreditCard,
  Database,
  Mail,
  Calendar,
  Globe,
  Smartphone,
  MapPin,
  Wallet,
  TrendingUp,
  UserCheck,
  ClipboardCheck,
  Package,
  Mic,
  QrCode
} from 'lucide-react';

const IntegrationCard = ({ integration, onConfigure, onToggleStatus }) => {
  // Function to get the appropriate icon
  const getIcon = (iconName) => {
    const iconMap = {
      Sheet,
      MessageSquare,
      Truck,
      Bell,
      Shield,
      Zap,
      Users,
      CreditCard,
      Database,
      Mail,
      Calendar,
      Globe,
      Smartphone,
      MapPin,
      Wallet,
      TrendingUp,
      UserCheck,
      ClipboardCheck,
      Package,
      Mic,
      QrCode
    };
    
    const IconComponent = iconMap[iconName] || Database;
    return <IconComponent className="w-8 h-8" />;
  };

  // Function to get category color
  const getCategoryColor = (category) => {
    const colors = {
      productivity: 'bg-blue-500',
      communication: 'bg-green-500',
      shipping: 'bg-orange-500',
      notification: 'bg-purple-500',
      security: 'bg-red-500',
      automation: 'bg-yellow-500',
      crm: 'bg-pink-500',
      payment: 'bg-emerald-500',
      location: 'bg-indigo-500',
      marketing: 'bg-rose-500',
      analytics: 'bg-cyan-500',
      feedback: 'bg-amber-500',
      inventory: 'bg-violet-500',
      ai: 'bg-teal-500',
      utility: 'bg-slate-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const isActive = integration.status === 'active';
  const isConfigured = integration.configRequired ? 
    Object.keys(integration.config).length > 0 && 
    Object.values(integration.config).some(value => 
      value !== '' && value !== null && value !== undefined
    ) : true;

  return (
    <Card className={`relative transition-all hover:shadow-md ${
      isActive ? 'border-primary' : 'border-border'
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Category Indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${getCategoryColor(integration.category)} rounded-l-lg`} />

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 pr-16">
          <div className={`p-2 rounded-lg ${
            isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {getIcon(integration.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1">
              {integration.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {integration.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Features Preview */}
        <div className="space-y-3 mb-4">
          <div className="text-sm text-muted-foreground">
            Key Features:
          </div>
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs"
              >
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Configuration Status */}
        {integration.configRequired && (
          <div className="mb-4">
            <div className={`flex items-center gap-2 text-sm ${
              isConfigured ? 'text-green-600' : 'text-orange-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              {isConfigured ? 'Configured' : 'Configuration Required'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onConfigure(integration)}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => onToggleStatus(integration.id)}
            disabled={integration.configRequired && !isConfigured}
            variant={isActive ? 'destructive' : 'default'}
            className="flex-1"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>

        {/* Warning for unconfigured integrations */}
        {integration.configRequired && !isConfigured && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
            Complete configuration before activating this integration.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
