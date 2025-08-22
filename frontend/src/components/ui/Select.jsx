import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ 
  children, 
  value, 
  onValueChange, 
  defaultValue,
  className,
  placeholder = "Select option",
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = (value) => {
    setSelectedValue(value);
    onValueChange?.(value);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Find the selected item's display text
  const getDisplayText = () => {
    if (!selectedValue) return placeholder;
    
    // Look through children to find the selected value
    let displayText = selectedValue;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem && child.props.value === selectedValue) {
        displayText = child.props.children;
      }
    });
    
    return displayText;
  };

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="text-left">
          {getDisplayText()}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === SelectItem) {
                return React.cloneElement(child, {
                  onClick: () => handleSelect(child.props.value),
                  className: cn(
                    child.props.className,
                    "cursor-pointer"
                  )
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

const SelectItem = React.forwardRef(({ className, value, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

// Export komponen yang diperlukan untuk kompatibilitas
const SelectTrigger = Select;
const SelectValue = ({ children }) => children;
const SelectContent = ({ children }) => children;

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
