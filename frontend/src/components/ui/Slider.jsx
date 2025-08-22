import React from 'react';
import { cn } from '@/utils/cn';

const Slider = React.forwardRef(({ 
  className,
  min = 0,
  max = 100,
  step = 1,
  value = [0],
  onValueChange,
  disabled = false,
  ...props 
}, ref) => {
  const handleChange = (e) => {
    const newValue = [parseFloat(e.target.value)];
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative w-full h-2 bg-secondary rounded-full">
        {/* Progress track */}
        <div 
          className="absolute h-2 bg-primary rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        {/* Range input */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "absolute inset-0 w-full h-2 cursor-pointer appearance-none bg-transparent outline-none disabled:pointer-events-none disabled:opacity-50",
            // Webkit thumb styles
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:focus-visible:outline-none [&::-webkit-slider-thumb]:focus-visible:ring-2 [&::-webkit-slider-thumb]:focus-visible:ring-ring [&::-webkit-slider-thumb]:focus-visible:ring-offset-2 [&::-webkit-slider-thumb]:disabled:pointer-events-none [&::-webkit-slider-thumb]:disabled:opacity-50",
            // Firefox thumb styles
            "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:focus-visible:outline-none [&::-moz-range-thumb]:focus-visible:ring-2 [&::-moz-range-thumb]:focus-visible:ring-ring [&::-moz-range-thumb]:focus-visible:ring-offset-2 [&::-moz-range-thumb]:disabled:pointer-events-none [&::-moz-range-thumb]:disabled:opacity-50",
            // Track styles
            "[&::-webkit-slider-track]:bg-transparent",
            "[&::-moz-range-track]:bg-transparent [&::-moz-range-track]:border-0"
          )}
          {...props}
        />
      </div>
    </div>
  );
});

Slider.displayName = "Slider";

export default Slider;
