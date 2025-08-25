import React from 'react';
import { StatisticsCard } from './StatisticsCard';
import { cn } from '@/lib/utils';

export const StatisticsGrid = ({
  items = [],
  columns = 4,
  gap = 6,
  className = '',
  children,
  ...props
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div
      className={cn(
        'grid',
        gridCols[columns] || gridCols[4],
        gapClasses[gap] || gapClasses[6],
        className
      )}
      {...props}
    >
      {items.map((item, index) => {
        const { key, ...itemProps } = item;
        return (
          <StatisticsCard
            key={key || index}
            {...itemProps}
          />
        );
      })}
      {children}
    </div>
  );
};

export default StatisticsGrid;
