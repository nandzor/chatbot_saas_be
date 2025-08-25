import React from 'react';
import { Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './index';
import { MoreHorizontal, Eye, Edit, Copy, Trash2 } from 'lucide-react';

export const DataTable = ({
  data = [],
  columns = [],
  actions = [],
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-sm',
    lg: 'text-base'
  };

  const cellPadding = {
    sm: 'py-2 px-3',
    default: 'py-3 px-4',
    lg: 'py-4 px-6'
  };

  const headerPadding = {
    sm: 'py-2 px-3',
    default: 'py-3 px-4',
    lg: 'py-4 px-6'
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((column, index) => (
                  <th key={index} className={`text-left font-medium text-gray-700 ${headerPadding[size]}`}>
                    {column.header}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className={`text-left font-medium text-gray-700 ${headerPadding[size]}`}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className={cellPadding[size]}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className={cellPadding[size]}>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">{emptyMessage}</div>
      </div>
    );
  }

  const renderCellValue = (item, column) => {
    const value = column.accessor ? column.accessor(item) : item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'badge') {
      return (
        <Badge variant={column.badgeVariant || 'default'}>
          {value}
        </Badge>
      );
    }

    if (column.type === 'status') {
      const statusConfig = column.statusConfig?.[value] || {};
      return (
        <Badge variant={statusConfig.variant || 'default'}>
          {statusConfig.icon && <statusConfig.icon className="w-3 h-3 mr-1" />}
          {statusConfig.label || value}
        </Badge>
      );
    }

    if (column.type === 'text') {
      return (
        <div className="max-w-xs">
          <div className="font-medium">{value}</div>
          {column.subtitle && (
            <div className="text-sm text-gray-500 truncate">
              {column.subtitle(item)}
            </div>
          )}
        </div>
      );
    }

    return value;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`text-left font-medium text-gray-700 ${headerPadding[size]} ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className={`text-left font-medium text-gray-700 ${headerPadding[size]}`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`${cellPadding[size]} ${column.className || ''}`}
                  >
                    {renderCellValue(item, column)}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className={cellPadding[size]}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {actions.map((action, actionIndex) => (
                          <React.Fragment key={actionIndex}>
                            {action.separator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(item);
                              }}
                              className={action.className || ''}
                            >
                              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                              {action.label}
                            </DropdownMenuItem>
                          </React.Fragment>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
