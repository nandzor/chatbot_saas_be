import React from 'react';
import { Copy as CopyIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

const Copy = React.forwardRef(({ className, ...props }, ref) => (
  <CopyIcon
    ref={ref}
    className={cn("w-4 h-4", className)}
    {...props}
  />
));

Copy.displayName = "Copy";

export default Copy;
