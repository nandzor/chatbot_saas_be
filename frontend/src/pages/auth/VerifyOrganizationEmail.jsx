/**
 * Organization Email Verification Page
 * Handles organization email verification after registration
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
  Card,
  CardContent,
  Button,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  CheckCircle,
  XCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  Building
} from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

const VerifyOrganizationEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { announce } = useAnnouncement();
  const { } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verifying, success, error
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [tokenEmail, setTokenEmail] = useState('');

  const token = searchParams.get('token');

  const getEmailFromToken = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/get-email-from-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTokenEmail(result.data.email);
      }
    } catch (err) {
      // Failed to get email from token - will use fallback
    }
  }, [token]);

  const verifyEmail = useCallback(async () => {
    try {
      setLoading('verify', true);
      setError(null);
      setVerificationStatus('verifying');

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/verify-organization-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed');
      }

      setVerificationData(result.data);
      setVerificationStatus('success');
      announce('Organization email verified successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);

    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Email Verification',
        showToast: false
      });
      setError(errorResult.message);
      setVerificationStatus('error');
      announce('Email verification failed. Please try again.');
    } finally {
      setLoading('verify', false);
    }
  }, [token, setLoading, announce, navigate]);

  // Get email from token on component mount (without auto-verification)
  useEffect(() => {
    if (token) {
      getEmailFromToken();
    } else {
      setError('No verification token provided');
      setVerificationStatus('error');
    }
  }, [token, getEmailFromToken]);

  const resendVerification = async () => {
    try {
      setLoading('resend', true);
      setError(null);

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          email: tokenEmail,
          type: 'organization_verification'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend verification');
      }

      announce('Verification email sent successfully!');
      setError(null);

    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Resend Verification',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('resend', false);
    }
  };

  const handleLogin = () => {
    navigate('/auth/login');
    announce('Navigating to login page');
  };

  if (verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verify Your Organization Email
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Click the button below to verify your organization email address.
              </p>

              {tokenEmail && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {tokenEmail}
                  </p>
                </div>
              )}

              <Button
                onClick={verifyEmail}
                disabled={getLoadingState('verify') || !tokenEmail}
                className="w-full"
              >
                {getLoadingState('verify') ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Email Address
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={getLoadingState('resend') || !tokenEmail}
                className="w-full mt-3"
              >
                {getLoadingState('resend') ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleLogin}
                className="w-full mt-3"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-sm text-gray-600">
                Please wait while we verify your organization email address...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Your organization email has been verified and your account is now active.
              </p>

              {verificationData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Organization Details</span>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>Organization:</strong> {verificationData.organization?.name}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Code:</strong> {verificationData.organization?.org_code}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 mb-4">
                Redirecting to login page in a few seconds...
              </p>

              <Button onClick={handleLogin} className="w-full">
                Go to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We couldn't verify your email address. This could be due to an expired or invalid verification link.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={verifyEmail}
                disabled={getLoadingState('verify')}
                className="w-full"
              >
                {getLoadingState('verify') ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={resendVerification}
                disabled={getLoadingState('resend') || !tokenEmail}
                className="w-full"
              >
                {getLoadingState('resend') ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleLogin}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Need help? Contact our{' '}
                <Link to="/support" className="text-indigo-600 hover:text-indigo-500">
                  support team
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withErrorHandling(VerifyOrganizationEmail, {
  context: 'Organization Email Verification Page'
});
