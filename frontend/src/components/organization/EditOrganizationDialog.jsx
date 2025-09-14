import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Building2,
  Save,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Settings,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  DollarSign
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  Textarea,
  Label
} from '@/components/ui';

const EditOrganizationDialog = ({ isOpen, onClose, onSubmit, organization, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxId: '',
    businessType: 'startup',
    industry: 'technology',
    companySize: '1-10',
    timezone: 'Asia/Jakarta',
    locale: 'id',
    currency: 'IDR',
    subscriptionStatus: 'trial',
    trialEndsAt: '',
    billingCycle: 'monthly',
    apiEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    settings: {},
    metadata: {
      description: '',
      foundedYear: '',
      headquarters: '',
      socialMedia: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      }
    }
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        displayName: organization.displayName || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address: organization.address || '',
        website: organization.website || '',
        taxId: organization.taxId || '',
        businessType: organization.businessType || 'startup',
        industry: organization.industry || 'technology',
        companySize: organization.companySize || '1-10',
        timezone: organization.timezone || 'Asia/Jakarta',
        locale: organization.locale || 'id',
        currency: organization.currency || 'IDR',
        subscriptionStatus: organization.subscriptionStatus || 'trial',
        trialEndsAt: organization.trialEndsAt ? organization.trialEndsAt.split('T')[0] : '',
        billingCycle: organization.billingCycle || 'monthly',
        apiEnabled: organization.apiEnabled || false,
        webhookUrl: organization.webhookUrl || '',
        webhookSecret: organization.webhookSecret || '',
        settings: organization.settings || {},
        metadata: {
          description: organization.metadata?.description || '',
          foundedYear: organization.metadata?.foundedYear || '',
          headquarters: organization.metadata?.headquarters || '',
          socialMedia: {
            linkedin: organization.metadata?.socialMedia?.linkedin || '',
            twitter: organization.metadata?.socialMedia?.twitter || '',
            facebook: organization.metadata?.socialMedia?.facebook || '',
            instagram: organization.metadata?.socialMedia?.instagram || ''
          }
        }
      });
    }
  }, [organization]);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Handle metadata changes
  const handleMetadataChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  }, []);

  // Handle social media changes
  const handleSocialMediaChange = useCallback((platform, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        socialMedia: {
          ...prev.metadata.socialMedia,
          [platform]: value
        }
      }
    }));
  }, []);

  // Generate trial end date (14 days from now)
  const generateTrialEndDate = useCallback(() => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    const formattedDate = trialEndDate.toISOString().split('T')[0];
    handleInputChange('trialEndsAt', formattedDate);
  }, [handleInputChange]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }

    if (formData.webhookUrl && !/^https?:\/\/.+/.test(formData.webhookUrl)) {
      newErrors.webhookUrl = 'Please enter a valid webhook URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(organization.id, formData);
    } catch (error) {
    }
  }, [formData, validateForm, onSubmit, organization]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      displayName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      taxId: '',
      businessType: 'startup',
      industry: 'technology',
      companySize: '1-10',
      timezone: 'Asia/Jakarta',
      locale: 'id',
      currency: 'IDR',
      subscriptionStatus: 'trial',
      trialEndsAt: '',
      billingCycle: 'monthly',
      apiEnabled: false,
      webhookUrl: '',
      webhookSecret: '',
      settings: {},
      metadata: {
        description: '',
        foundedYear: '',
        headquarters: '',
        socialMedia: {
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: ''
        }
      }
    });
    setErrors({});
    setActiveTab('basic');
  }, []);

  // Handle dialog close
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen || !organization) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'business', label: 'Business', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'metadata', label: 'Additional', icon: Hash }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Organization</h2>
              <p className="text-sm text-gray-500">
                Update organization: <span className="font-medium">{organization.name}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Organization Details</span>
                    </CardTitle>
                    <CardDescription>
                      Basic information about the organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Organization Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter organization name"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          placeholder="Enter display name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter organization address"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://example.com"
                          className={errors.website ? 'border-red-500' : ''}
                        />
                        {errors.website && (
                          <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          value={formData.taxId}
                          onChange={(e) => handleInputChange('taxId', e.target.value)}
                          placeholder="Enter tax ID"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Business Information Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Business Information</span>
                    </CardTitle>
                    <CardDescription>
                      Business details and classification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => handleInputChange('businessType', value)}
                          placeholder="Select business type"
                          className={errors.businessType ? 'border-red-500' : ''}
                        >
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="small_business">Small Business</SelectItem>
                          <SelectItem value="medium_business">Medium Business</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="non_profit">Non-Profit</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </Select>
                        {errors.businessType && (
                          <p className="text-sm text-red-500 mt-1">{errors.businessType}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="industry">Industry *</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleInputChange('industry', value)}
                          placeholder="Select industry"
                          className={errors.industry ? 'border-red-500' : ''}
                        >
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </Select>
                        {errors.industry && (
                          <p className="text-sm text-red-500 mt-1">{errors.industry}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="companySize">Company Size *</Label>
                        <Select
                          value={formData.companySize}
                          onValueChange={(value) => handleInputChange('companySize', value)}
                          placeholder="Select company size"
                          className={errors.companySize ? 'border-red-500' : ''}
                        >
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </Select>
                        {errors.companySize && (
                          <p className="text-sm text-red-500 mt-1">{errors.companySize}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Subscription Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Configure subscription and billing settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                        <Select
                          value={formData.subscriptionStatus}
                          onValueChange={(value) => handleInputChange('subscriptionStatus', value)}
                          placeholder="Select status"
                        >
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="billingCycle">Billing Cycle</Label>
                        <Select
                          value={formData.billingCycle}
                          onValueChange={(value) => handleInputChange('billingCycle', value)}
                          placeholder="Select billing cycle"
                        >
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="trialEndsAt">Trial End Date</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="trialEndsAt"
                            type="date"
                            value={formData.trialEndsAt}
                            onChange={(e) => handleInputChange('trialEndsAt', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateTrialEndDate}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
                    <CardDescription>
                      Configure system and API settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={formData.timezone}
                          onValueChange={(value) => handleInputChange('timezone', value)}
                          placeholder="Select timezone"
                        >
                          <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                          <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="locale">Locale</Label>
                        <Select
                          value={formData.locale}
                          onValueChange={(value) => handleInputChange('locale', value)}
                          placeholder="Select locale"
                        >
                          <SelectItem value="id">Indonesian</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="th">Thai</SelectItem>
                          <SelectItem value="vi">Vietnamese</SelectItem>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleInputChange('currency', value)}
                          placeholder="Select currency"
                        >
                          <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                          <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                          <SelectItem value="VND">VND (Vietnamese Dong)</SelectItem>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="apiEnabled"
                        checked={formData.apiEnabled}
                        onCheckedChange={(checked) => handleInputChange('apiEnabled', checked)}
                      />
                      <Label htmlFor="apiEnabled">Enable API Access</Label>
                    </div>

                    {formData.apiEnabled && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <Input
                            id="webhookUrl"
                            value={formData.webhookUrl}
                            onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                            placeholder="https://example.com/webhook"
                            className={errors.webhookUrl ? 'border-red-500' : ''}
                          />
                          {errors.webhookUrl && (
                            <p className="text-sm text-red-500 mt-1">{errors.webhookUrl}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="webhookSecret">Webhook Secret</Label>
                          <Input
                            id="webhookSecret"
                            value={formData.webhookSecret}
                            onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                            placeholder="Enter webhook secret"
                            type="password"
                          />
                        </div>
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
                    <CardDescription>
                      Additional details and social media links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.metadata.description}
                        onChange={(e) => handleMetadataChange('description', e.target.value)}
                        placeholder="Enter organization description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="foundedYear">Founded Year</Label>
                        <Input
                          id="foundedYear"
                          type="number"
                          value={formData.metadata.foundedYear}
                          onChange={(e) => handleMetadataChange('foundedYear', e.target.value)}
                          placeholder="e.g., 2020"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      <div>
                        <Label htmlFor="headquarters">Headquarters</Label>
                        <Input
                          id="headquarters"
                          value={formData.metadata.headquarters}
                          onChange={(e) => handleMetadataChange('headquarters', e.target.value)}
                          placeholder="Enter headquarters location"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Social Media</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={formData.metadata.socialMedia.linkedin}
                            onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/company/example"
                          />
                        </div>

                        <div>
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            value={formData.metadata.socialMedia.twitter}
                            onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                            placeholder="https://twitter.com/example"
                          />
                        </div>

                        <div>
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={formData.metadata.socialMedia.facebook}
                            onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                            placeholder="https://facebook.com/example"
                          />
                        </div>

                        <div>
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            value={formData.metadata.socialMedia.instagram}
                            onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                            placeholder="https://instagram.com/example"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Organization
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrganizationDialog;
