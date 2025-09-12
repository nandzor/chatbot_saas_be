import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef(({
  className,
  checked = false,
  onChange,
  onCheckedChange,
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => {
          if (onChange) {
            onChange(e);
          }
          if (onCheckedChange) {
            onCheckedChange(e.target.checked);
          }
        }}
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
