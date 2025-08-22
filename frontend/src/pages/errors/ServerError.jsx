import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const ServerError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Server Error
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Something went wrong on our end. We're working to fix the issue. Please try again later.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <div>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
