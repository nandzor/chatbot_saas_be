import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Settings,
  Hash,
  DollarSign,
  Edit,
  Trash2,
  UserPlus,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton
} from '@/components/ui';

const OrganizationDetailsModal = ({
  isOpen,
  onClose,
  organization,
  onEdit,
  onDelete,
  onAddUser,
  onRemoveUser,
  onUpdateSubscription,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedField, setCopiedField] = useState(null);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
    }
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Format trial end date
  const formatTrialEndDate = useCallback((dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  }, []);

  // Get status info
  const getStatusInfo = useCallback((status) => {
    const statusMap = {
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' }
    };
    return statusMap[status] || { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  }, []);

  const getSubscriptionStatusInfo = useCallback((status) => {
    const statusMap = {
      trial: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Trial' },
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return statusMap[status] || { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setCopiedField(null);
    }
  }, [isOpen]);

  if (!isOpen || !organization) return null;

  const statusInfo = getStatusInfo(organization.status);
  const subscriptionStatusInfo = getSubscriptionStatusInfo(organization.subscriptionStatus);
  const trialInfo = formatTrialEndDate(organization.trialEndsAt);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'metadata', label: 'Additional', icon: Hash }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{organization.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {organization.orgCode}
                </Badge>
                <Badge className={`${statusInfo.color} text-xs`}>
                  <statusInfo.icon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge className={`${subscriptionStatusInfo.color} text-xs`}>
                  <subscriptionStatusInfo.icon className="h-3 w-3 mr-1" />
                  {subscriptionStatusInfo.label}
                </Badge>
                {trialInfo && (
                  <Badge variant="outline" className={`text-xs ${trialInfo.color} ${trialInfo.bgColor}`}>
                    {trialInfo.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(organization)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddUser(organization)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" size="sm" onClick={() => onUpdateSubscription(organization)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Subscription
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex-shrink-0">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Organization Name</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm font-medium">{organization.name}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(organization.name, 'name')}
                                >
                                  {copiedField === 'name' ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>

                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {organization.displayName && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Display Name</label>
                          <p className="text-sm font-medium mt-1">{organization.displayName}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-sm">{organization.email}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(organization.email, 'email')}
                                >
                                  {copiedField === 'email' ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {organization.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{organization.phone}</p>
                          </div>
                        </div>
                      )}

                      {organization.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Website</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <a
                              href={organization.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <span>{organization.website}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {organization.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <div className="flex items-start space-x-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <p className="text-sm">{organization.address}</p>
                          </div>
                        </div>
                      )}

                      {organization.taxId && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Tax ID</label>
                          <p className="text-sm font-mono mt-1">{organization.taxId}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="text-sm">{formatDate(organization.createdAt)}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="text-sm">{formatDate(organization.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Business Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business Type</label>
                      <Badge variant="secondary" className="mt-1">
                        {organization.businessType?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <Badge variant="secondary" className="mt-1">
                        {organization.industry}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Size</label>
                      <Badge variant="secondary" className="mt-1">
                        {organization.companySize} employees
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Subscription Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subscription Status</label>
                        <div className="mt-1">
                          <Badge className={`${subscriptionStatusInfo.color}`}>
                            <subscriptionStatusInfo.icon className="h-3 w-3 mr-1" />
                            {subscriptionStatusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Billing Cycle</label>
                        <p className="text-sm mt-1 capitalize">{organization.billingCycle}</p>
                      </div>

                      {organization.subscriptionPlan && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Plan</label>
                          <p className="text-sm mt-1">{organization.subscriptionPlan.name}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {organization.trialEndsAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Trial End Date</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{formatDate(organization.trialEndsAt)}</p>
                          </div>
                        </div>
                      )}

                      {organization.subscriptionStartsAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Subscription Start</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{formatDate(organization.subscriptionStartsAt)}</p>
                          </div>
                        </div>
                      )}

                      {organization.subscriptionEndsAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Subscription End</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{formatDate(organization.subscriptionEndsAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Organization Users</span>
                      </CardTitle>
                      <CardDescription>
                        Manage users in this organization
                      </CardDescription>
                    </div>
                    <Button onClick={() => onAddUser(organization)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {organization.users && organization.users.length > 0 ? (
                    <div className="space-y-3">
                      {organization.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {user.full_name?.charAt(0) || user.email?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.full_name || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveUser(organization, user)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500 mb-4">This organization doesn't have any users yet.</p>
                      <Button onClick={() => onAddUser(organization)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First User
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>System Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timezone</label>
                      <p className="text-sm mt-1">{organization.timezone}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Locale</label>
                      <p className="text-sm mt-1">{organization.locale}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Currency</label>
                      <p className="text-sm mt-1">{organization.currency}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500">API Access</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {organization.apiEnabled ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>

                  {organization.apiEnabled && (
                    <div className="space-y-4">
                      {organization.webhookUrl && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Webhook URL</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {organization.webhookUrl}
                            </p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(organization.webhookUrl, 'webhook')}
                                  >
                                    {copiedField === 'webhook' ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Metadata Tab */}
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span>Additional Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {organization.metadata?.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm mt-1">{organization.metadata.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {organization.metadata?.foundedYear && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Founded Year</label>
                        <p className="text-sm mt-1">{organization.metadata.foundedYear}</p>
                      </div>
                    )}

                    {organization.metadata?.headquarters && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Headquarters</label>
                        <p className="text-sm mt-1">{organization.metadata.headquarters}</p>
                      </div>
                    )}
                  </div>

                  {organization.metadata?.socialMedia && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Social Media</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {Object.entries(organization.metadata.socialMedia).map(([platform, url]) => {
                          if (!url) return null;
                          return (
                            <div key={platform} className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 capitalize w-20">
                                {platform}:
                              </span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <span className="truncate">{url}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onUpdateSubscription(organization)}>
              <Settings className="h-4 w-4 mr-2" />
              Update Subscription
            </Button>
            <Button variant="outline" onClick={() => onAddUser(organization)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="destructive" onClick={() => onDelete(organization)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Organization
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailsModal;
