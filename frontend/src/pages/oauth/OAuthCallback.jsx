import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useOAuthCallback } from '@/hooks/useOAuthCallback';
import {
  OAuthStatusIcon,
  OAuthStatusTitle,
  OAuthStatusMessage
} from '@/components/oauth/OAuthStatusComponents';

const OAuthCallback = () => {
  const { status, message, handleRetry, handleGoToDashboard } = useOAuthCallback();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">
            <OAuthStatusTitle status={status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <OAuthStatusIcon status={status} />
          </div>

          <OAuthStatusMessage status={status} message={message} />

          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                Coba Lagi
              </Button>
              <Button
                variant="outline"
                onClick={handleGoToDashboard}
                className="w-full"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
