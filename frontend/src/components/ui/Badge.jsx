import React from 'react';
import { cn } from '@/utils/cn';

const Badge = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    indigo: "bg-indigo-100 text-indigo-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Badge.displayName = "Badge";

export default Badge;
