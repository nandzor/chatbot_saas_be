/**
 * Organization Registration Page
 * Multi-step organization registration with professional UI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import OrganizationRegistrationForm from '@/components/forms/OrganizationRegistrationForm';
import { ArrowLeft } from 'lucide-react';

const RegisterOrganization = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                to="/auth/login"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <OrganizationRegistrationForm />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </Link>
            </p>
            <p className="mt-2">
              Need help? Contact our{' '}
              <Link to="/support" className="text-indigo-600 hover:text-indigo-500">
                support team
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterOrganization;
