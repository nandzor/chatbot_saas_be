import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "border-border bg-background text-foreground",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    success: "border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-500",
    info: "border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-500",
    warning: "border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-500",
  };

  const icons = {
    default: null,
    destructive: <XCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
        variants[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      {children}
    </div>
  );
});

Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
