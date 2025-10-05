/**
 * OAuth Error Notification Component
 * Component untuk menampilkan error notifications dengan retry dan suggestions
 */

import { useState, useEffect } from 'react';
import { Alert } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  AlertCircle,
  RefreshCw,
  X,
  Clock,
  Lightbulb,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

const OAuthErrorNotification = ({
  error,
  onRetry,
  onDismiss,
  onShowSuggestions,
  showRetry = true,
  showSuggestions = true,
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setTimeLeft(duration / 1000);

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      // Countdown timer
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [error, duration, onDismiss]);

  const handleRetry = async () => {
    if (!error?.is_retryable || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry?.(error);
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleShowSuggestions = () => {
    setShowSuggestionsModal(true);
    onShowSuggestions?.(error);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !error) return null;

  const getErrorIcon = () => {
    switch (error.error_code) {
      case 'network_timeout':
      case 'network_unreachable':
        return <RefreshCw className="w-4 h-4" />;
      case 'access_denied':
      case 'insufficient_permissions':
        return <AlertCircle className="w-4 h-4" />;
      case 'quota_exceeded':
      case 'rate_limit_exceeded':
        return <Clock className="w-4 h-4" />;
      case 'token_expired':
      case 'refresh_token_expired':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getErrorSeverity = () => {
    switch (error.error_code) {
      case 'access_denied':
      case 'insufficient_permissions':
      case 'invalid_credentials':
        return 'error';
      case 'quota_exceeded':
      case 'rate_limit_exceeded':
        return 'warning';
      case 'network_timeout':
      case 'network_unreachable':
        return 'info';
      default:
        return 'error';
    }
  };

  const getErrorBadge = () => {
    switch (error.error_code) {
      case 'retryable':
        return <Badge variant="default" className="text-xs">Retryable</Badge>;
      case 'quota_exceeded':
        return <Badge variant="warning" size="sm">Quota</Badge>;
      case 'rate_limit_exceeded':
        return <Badge variant="warning" size="sm">Rate Limit</Badge>;
      case 'network_timeout':
        return <Badge variant="default" className="text-xs">Network</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`fixed ${position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'} z-50 max-w-md`}>
        <Alert variant={getErrorSeverity()} className="shadow-lg border-l-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getErrorIcon()}
            </div>

            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  OAuth Error
                </h3>
                <div className="flex items-center space-x-2">
                  {getErrorBadge()}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="p-1 h-auto"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="mt-1">
                <p className="text-sm text-gray-600">
                  {error.user_message}
                </p>

                {error.context && (
                  <p className="text-xs text-gray-500 mt-1">
                    Context: {error.context}
                  </p>
                )}

                {error.retry_after && (
                  <p className="text-xs text-gray-500 mt-1">
                    Retry after: {error.retry_after}s
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {showRetry && error.is_retryable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="text-xs"
                    >
                      {isRetrying ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </>
                      )}
                    </Button>
                  )}

                  {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShowSuggestions}
                      className="text-xs"
                    >
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Suggestions
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  {timeLeft}s
                </div>
              </div>
            </div>
          </div>
        </Alert>
      </div>

      {/* Suggestions Dialog */}
      {showSuggestionsModal && (
        <Dialog open={true} onOpenChange={() => setShowSuggestionsModal(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                Error Suggestions
              </DialogTitle>
              <DialogDescription>
                Here are some suggestions to help resolve this issue:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {error.suggestions?.map((suggestion, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSuggestionsModal(false)}
              >
                Close
              </Button>
              {showRetry && error.is_retryable && (
                <Button
                  onClick={() => {
                    setShowSuggestionsModal(false);
                    handleRetry();
                  }}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default OAuthErrorNotification;
