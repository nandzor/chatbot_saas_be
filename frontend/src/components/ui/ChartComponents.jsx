import React from 'react';
import { cn } from '@/utils/cn';

const ChartContainer = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  >
    {children}
  </div>
));
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}
    {...props}
  >
    {children}
  </div>
));
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip>
        <div className="grid grid-cols-1 gap-2">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </ChartTooltip>
    );
  }
  return null;
};

ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
