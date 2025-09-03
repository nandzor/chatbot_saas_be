import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({
  children,
  value,
  onValueChange,
  defaultValue,
  className,
  placeholder = "Select option",
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectRef = useRef(null);

  // Determine if component is controlled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle value changes
  const handleValueChange = useCallback((newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }

    if (onValueChange) {
      onValueChange(newValue);
    }

    setIsOpen(false);
  }, [isControlled, onValueChange]);

  // Toggle dropdown
  const toggleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);

  // Get display text for selected value
  const displayText = useMemo(() => {
    if (!currentValue) {
      return placeholder;
    }

    let text = currentValue;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem && child.props.value === currentValue) {
        text = child.props.children;
      }
    });

    return text;
  }, [currentValue, placeholder, children]);

  // Render select items
  const selectItems = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        return React.cloneElement(child, {
          key: child.props.value,
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleValueChange(child.props.value);
          },
          className: cn(
            child.props.className,
            "cursor-pointer hover:bg-accent hover:text-accent-foreground"
          )
        });
      }
      return child;
    });
  }, [children, handleValueChange]);

  return (
    <div ref={selectRef} className="relative">
      <button
        ref={ref}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="text-left">
          {displayText}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {selectItems}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

const SelectItem = React.forwardRef(({ className, value, children, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={onClick}
    role="option"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e);
      }
    }}
    {...props}
  >
    {children}
  </div>
));

SelectItem.displayName = "SelectItem";

// Additional components for compatibility
const SelectTrigger = React.forwardRef(({ children, ...props }, ref) => {
  return React.cloneElement(children, { ref, ...props });
});

SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, children }) => {
  return children || placeholder;
};

SelectValue.displayName = "SelectValue";

const SelectContent = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

SelectContent.displayName = "SelectContent";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
