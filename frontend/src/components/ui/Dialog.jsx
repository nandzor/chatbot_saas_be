import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { Button } from './index';

// Context for Dialog state
const DialogContext = createContext();

const Dialog = ({ 
  open, 
  onOpenChange, 
  children, 
  className,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  if (!isOpen) return null;

  return (
    <DialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",
          className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleOpenChange(false);
          }
        }}
        {...props}
      >
        {children}
      </div>
    </DialogContext.Provider>
  );
};
Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl",
      className
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-6 border-b",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-xl font-semibold",
      className
    )}
    {...props}
  >
    {children}
  </h2>
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </p>
));
DialogDescription.displayName = "DialogDescription";

const DialogClose = React.forwardRef(({ 
  className, 
  onClick,
  ...props 
}, ref) => {
  const context = useContext(DialogContext);
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (context?.onOpenChange) {
      context.onOpenChange(false);
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("h-8 w-8 p-0", className)}
      {...props}
    >
      <X className="w-4 h-4" />
    </Button>
  );
});
DialogClose.displayName = "DialogClose";

const DialogBody = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DialogBody.displayName = "DialogBody";

const DialogFooter = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex justify-end gap-2 p-6 border-t",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DialogFooter.displayName = "DialogFooter";

const DialogTrigger = React.forwardRef(({ 
  asChild = false,
  children, 
  onClick,
  ...props 
}, ref) => {
  const context = useContext(DialogContext);
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (context?.onOpenChange) {
      context.onOpenChange(true);
    }
  };

  if (asChild) {
    return React.cloneElement(children, {
      ref,
      onClick: handleClick,
      ...props
    });
  }
  
  return (
    <div
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
});
DialogTrigger.displayName = "DialogTrigger";

export { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogClose, 
  DialogBody, 
  DialogFooter,
  DialogTrigger
};
