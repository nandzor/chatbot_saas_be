/**
 * Toast Demo Component
 * For testing notification system
 */

import { notifySuccess, notifyError, notifyInfo, notifyWarning } from '@/utils/notify';

const ToastDemo = () => {
  const handleSuccess = () => {
    notifySuccess('Operasi berhasil diselesaikan!');
  };

  const handleError = () => {
    notifyError('Terjadi kesalahan saat memproses data');
  };

  const handleInfo = () => {
    notifyInfo('Informasi: Data sedang dimuat');
  };

  const handleWarning = () => {
    notifyWarning('Peringatan: Pastikan data sudah benar');
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toast Notification Demo</h2>
      <div className="flex gap-4">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Success Toast
        </button>
        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Error Toast
        </button>
        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Info Toast
        </button>
        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Warning Toast
        </button>
      </div>
    </div>
  );
};

export default ToastDemo;
