/**
 * Organization Registration Form Component
 * Multi-step form for organization self-registration
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useLoadingStates
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import {
  Card,
  CardContent,
  Button,
  Alert,
  AlertDescription,
  Form
} from '@/components/ui';
import { StepProgress } from '@/components/ui/StepProgress';
import {
  Mail,
  Lock,
  User,
  Building,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Phone,
  MapPin,
  Briefcase,
  Users,
  FileText,
  Shield
} from 'lucide-react';

const OrganizationRegistrationForm = () => {
  const navigate = useNavigate();
  const { announce } = useAnnouncement();
  const { setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData] = useState({
    // Organization Information
    organization_name: '',
    organization_email: '',
    organization_phone: '',
    organization_address: '',
    organization_website: '',
    business_type: '',
    industry: '',
    company_size: '',
    tax_id: '',
    description: '',

    // Admin User Information
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_username: '',
    admin_password: '',
    admin_password_confirmation: '',
    admin_phone: '',

    // Preferences
    timezone: 'Asia/Jakarta',
    locale: 'id',
    currency: 'IDR',

    // Terms and Conditions
    terms_accepted: false,
    privacy_policy_accepted: false,
    marketing_consent: false,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Business type options
  const businessTypes = useMemo(() => [
    { value: 'startup', label: 'Startup' },
    { value: 'small_business', label: 'Small Business' },
    { value: 'medium_business', label: 'Medium Business' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'non_profit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'technology', label: 'Technology' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' },
  ], []);

  // Company size options
  const companySizes = useMemo(() => [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ], []);

  // Form steps configuration
  const steps = useMemo(() => [
    {
      id: 1,
      title: 'Organization Information',
      description: 'Tell us about your organization',
      icon: Building,
    },
    {
      id: 2,
      title: 'Admin Account',
      description: 'Create your admin account',
      icon: User,
    },
    {
      id: 3,
      title: 'Preferences',
      description: 'Set your preferences',
      icon: Globe,
    },
    {
      id: 4,
      title: 'Terms & Conditions',
      description: 'Review and accept terms',
      icon: Shield,
    },
  ], []);

  // Step 1: Organization Information
  const organizationFields = useMemo(() => [
    {
      name: 'organization_name',
      type: 'text',
      label: 'Organization Name',
      placeholder: 'Enter your organization name',
      required: true,
      icon: Building,
    },
    {
      name: 'organization_email',
      type: 'email',
      label: 'Organization Email',
      placeholder: 'Enter organization email',
      required: true,
      icon: Mail,
    },
    {
      name: 'organization_phone',
      type: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      required: false,
      icon: Phone,
    },
    {
      name: 'organization_address',
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter organization address',
      required: false,
      icon: MapPin,
    },
    {
      name: 'organization_website',
      type: 'url',
      label: 'Website',
      placeholder: 'https://example.com',
      required: false,
      icon: Globe,
    },
    {
      name: 'business_type',
      type: 'select',
      label: 'Business Type',
      required: false,
      icon: Briefcase,
      options: businessTypes,
    },
    {
      name: 'industry',
      type: 'text',
      label: 'Industry',
      placeholder: 'Enter your industry',
      required: false,
      icon: Briefcase,
    },
    {
      name: 'company_size',
      type: 'select',
      label: 'Company Size',
      required: false,
      icon: Users,
      options: companySizes,
    },
    {
      name: 'tax_id',
      type: 'text',
      label: 'Tax ID / NPWP',
      placeholder: 'Enter tax ID',
      required: false,
      icon: FileText,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Brief description of your organization',
      required: false,
      icon: FileText,
    },
  ], [businessTypes, companySizes]);

  // Step 2: Admin User Information
  const adminFields = useMemo(() => [
    {
      name: 'admin_first_name',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      icon: User,
    },
    {
      name: 'admin_last_name',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      icon: User,
    },
    {
      name: 'admin_email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true,
      icon: Mail,
    },
    {
      name: 'admin_username',
      type: 'text',
      label: 'Username',
      placeholder: 'Choose a username',
      required: false,
      icon: User,
    },
    {
      name: 'admin_password',
      type: 'password',
      label: 'Password',
      placeholder: 'Create a password',
      required: true,
      icon: Lock,
      showPasswordToggle: true,
    },
    {
      name: 'admin_password_confirmation',
      type: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      required: true,
      icon: Lock,
      showPasswordToggle: true,
    },
    {
      name: 'admin_phone',
      type: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      required: false,
      icon: Phone,
    },
  ], []);

  // Step 3: Preferences
  const preferenceFields = useMemo(() => [
    {
      name: 'timezone',
      type: 'select',
      label: 'Timezone',
      required: true,
      icon: Globe,
      options: [
        { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
        { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
        { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' },
        { value: 'UTC', label: 'UTC' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      label: 'Language',
      required: true,
      icon: Globe,
      options: [
        { value: 'id', label: 'Bahasa Indonesia' },
        { value: 'en', label: 'English' },
      ],
    },
    {
      name: 'currency',
      type: 'select',
      label: 'Currency',
      required: true,
      icon: Globe,
      options: [
        { value: 'IDR', label: 'Indonesian Rupiah (IDR)' },
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'SGD', label: 'Singapore Dollar (SGD)' },
        { value: 'MYR', label: 'Malaysian Ringgit (MYR)' },
        { value: 'THB', label: 'Thai Baht (THB)' },
      ],
    },
  ], []);

  // Step 4: Terms and Conditions
  const termsFields = useMemo(() => [
    {
      name: 'terms_accepted',
      type: 'checkbox',
      label: 'I agree to the Terms and Conditions',
      required: true,
      description: 'You must agree to the terms and conditions to continue',
    },
    {
      name: 'privacy_policy_accepted',
      type: 'checkbox',
      label: 'I agree to the Privacy Policy',
      required: true,
      description: 'You must agree to the privacy policy to continue',
    },
    {
      name: 'marketing_consent',
      type: 'checkbox',
      label: 'I would like to receive marketing communications (optional)',
      required: false,
      description: 'Optional: Receive updates about new features and services',
    },
  ], []);

  // Validation rules
  const validationRules = {
    organization_name: {
      required: true,
      minLength: 2,
      maxLength: 255,
      custom: (value) => {
        if (!validateInput.noScriptTags(value)) {
          return 'Invalid characters detected';
        }
        if (!/^[a-zA-Z0-9\s\-.&()]+$/.test(value)) {
          return 'Organization name can only contain letters, numbers, spaces, and special characters: - . & ( )';
        }
        return null;
      }
    },
    organization_email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please enter a valid email address',
      custom: (value) => {
        if (!validateInput.email(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    },
    organization_phone: {
      required: false,
      pattern: /^[+]?[1-9][\d]{0,15}$/,
      patternMessage: 'Please enter a valid phone number',
    },
    organization_website: {
      required: false,
      pattern: /^https?:\/\/.+/,
      patternMessage: 'Please enter a valid URL starting with http:// or https://',
    },
    admin_first_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      custom: (value) => {
        if (!validateInput.noScriptTags(value)) {
          return 'Invalid characters detected';
        }
        return null;
      }
    },
    admin_last_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      custom: (value) => {
        if (!validateInput.noScriptTags(value)) {
          return 'Invalid characters detected';
        }
        return null;
      }
    },
    admin_email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please enter a valid email address',
      custom: (value, allValues) => {
        if (!validateInput.email(value)) {
          return 'Please enter a valid email address';
        }
        if (value === allValues.organization_email) {
          return 'Admin email must be different from organization email';
        }
        return null;
      }
    },
    admin_username: {
      required: false,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9._-]+$/,
      patternMessage: 'Username can only contain letters, numbers, dots, underscores, and hyphens',
      custom: (value) => {
        if (value && ['admin', 'root', 'user', 'test', 'guest', 'administrator'].includes(value.toLowerCase())) {
          return 'Username cannot use reserved words';
        }
        return null;
      }
    },
    admin_password: {
      required: true,
      minLength: 8,
      custom: (value) => {
        if (!validateInput.password(value)) {
          return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        }
        return null;
      }
    },
    admin_password_confirmation: {
      required: true,
      custom: (value, allValues) => {
        if (value !== allValues.admin_password) {
          return 'Passwords do not match';
        }
        return null;
      }
    },
    admin_phone: {
      required: false,
      pattern: /^[+]?[1-9][\d]{0,15}$/,
      patternMessage: 'Please enter a valid phone number',
    },
    terms_accepted: {
      required: true,
      custom: (value) => {
        if (!value) {
          return 'You must agree to the terms and conditions';
        }
        return null;
      }
    },
    privacy_policy_accepted: {
      required: true,
      custom: (value) => {
        if (!value) {
          return 'You must agree to the privacy policy';
        }
        return null;
      }
    },
    marketing_consent: {
      required: false,
    },
  };

  // Handle form submission
  const handleSubmit = useCallback(async (values) => {
    try {
      setLoading('submit', true);
      setError(null);
      setSuccess(false);

      // Sanitize input
      const sanitizedData = Object.keys(values).reduce((acc, key) => {
        if (typeof values[key] === 'string') {
          acc[key] = sanitizeInput(values[key]);
        } else {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      // Prepare data for API
      const registrationData = {
        ...sanitizedData,
        admin_password_confirmation: sanitizedData.admin_password_confirmation,
      };

      // Call API
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
      const response = await fetch(`${apiBaseUrl}/register-organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccess(true);
      announce('Organization registration successful! Please check your email for verification.');

      // Redirect to login after success
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);

    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Organization Registration',
        showToast: true
      });
      setError(errorResult.message);
      announce('Organization registration failed. Please try again.');
    } finally {
      setLoading('submit', false);
    }
  }, [navigate, setLoading, announce]);

  // Get current step fields
  const getCurrentStepFields = useCallback(() => {
    switch (currentStep) {
      case 1:
        return organizationFields;
      case 2:
        return adminFields;
      case 3:
        return preferenceFields;
      case 4:
        return termsFields;
      default:
        return [];
    }
  }, [currentStep, organizationFields, adminFields, preferenceFields, termsFields]);

  // Validate current step - simplified to let Form component handle validation
  const validateCurrentStep = useCallback(() => {
    // The Form component will handle its own validation
    // This is just a placeholder that always returns valid
    // The actual validation happens in the Form component's onSubmit
    return { isValid: true };
  }, []);

  // Handle step navigation
  const handleNextStep = useCallback((values) => {
    // If we get here, the Form component has already validated the fields
    // So we can proceed to the next step
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
      announce(`Step ${currentStep + 1}: ${steps[currentStep].title}`);
    }
  }, [currentStep, steps, announce]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      announce(`Step ${currentStep - 1}: ${steps[currentStep - 2].title}`);
    }
  }, [currentStep, steps, announce]);

  // Focus management on step change
  useEffect(() => {
    setFocus();
  }, [currentStep, setFocus]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Registration Successful!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your organization has been registered. Please check your email for verification.
                Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Register Your Organization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your organization account and start using our chatbot platform
          </p>
        </div>

        {/* Progress Steps */}
        <StepProgress
          steps={steps.map(step => ({
            title: step.title,
            description: step.description,
            icon: step.icon
          }))}
          currentStep={currentStep}
          completedSteps={Array.from({ length: currentStep - 1 }, (_, i) => i + 1)}
          showLabels={true}
          showProgress={true}
          className="mb-8"
        />

        {/* Step Title */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6">
            <Form
              title=""
              description=""
              fields={getCurrentStepFields()}
              initialValues={formData}
              validationRules={validationRules}
              onSubmit={currentStep === steps.length ? handleSubmit : handleNextStep}
              submitText={currentStep === steps.length ? "Complete Registration" : "Next Step"}
              showProgress={true}
              autoSave={false}
              className=""
            >

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNextStep}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {getLoadingState('submit') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-600">Registering your organization...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default withErrorHandling(OrganizationRegistrationForm, {
  context: 'Organization Registration Form'
});
