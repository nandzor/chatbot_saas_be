import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef(({
  className,
  checked = false,
  indeterminate = false,
  onChange,
  onCheckedChange,
  disabled = false,
  ...props
}, ref) => {
  // Handle indeterminate state
  React.useEffect(() => {
    if (ref && ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate, ref]);

    const handleChange = React.useCallback((e) => {
    // Let the checkbox work naturally without preventing default
    if (onChange) {
      onChange(e);
    }
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  }, [onChange, onCheckedChange]);

  const handleClick = React.useCallback((e) => {
    // Prevent parent row/table click handlers
    e.stopPropagation();
  }, []);

  const handleMouseDown = React.useCallback((e) => {
    // Prevent parent from reacting on press
    e.stopPropagation();
  }, []);

  return (
    <div className="flex items-center space-x-2" onClick={handleClick} onMouseDown={handleMouseDown}>
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={handleChange}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        disabled={disabled}
        className={cn(
          "h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;
