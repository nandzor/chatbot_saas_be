import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  console.log('AuthLayout rendering...');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ChatBot Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Modern UI/UX Dashboard
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
