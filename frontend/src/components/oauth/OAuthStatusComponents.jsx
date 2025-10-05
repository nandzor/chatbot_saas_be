/**
 * OAuth Status Components
 * Reusable components untuk OAuth status display
 */

import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Status Icon Component
 */
export const OAuthStatusIcon = ({ status, className = "h-12 w-12" }) => {
  switch (status) {
    case 'processing':
      return <Loader2 className={`${className} text-blue-500 animate-spin`} />;
    case 'success':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'error':
      return <XCircle className={`${className} text-red-500`} />;
    default:
      return <Loader2 className={`${className} text-blue-500 animate-spin`} />;
  }
};

/**
 * Status Title Component
 */
export const OAuthStatusTitle = ({ status }) => {
  switch (status) {
    case 'processing':
      return 'Memproses Autentikasi';
    case 'success':
      return 'Berhasil!';
    case 'error':
      return 'Terjadi Kesalahan';
    default:
      return 'Memproses Autentikasi';
  }
};

/**
 * Status Message Component
 */
export const OAuthStatusMessage = ({ status, message }) => {
  if (status === 'success') {
    return (
      <>
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500">
          Mengalihkan ke halaman Google Drive...
        </p>
      </>
    );
  }

  return <p className="text-gray-600">{message}</p>;
};
