/**
 * Knowledge Bulk Actions Component
 * Optimized component untuk bulk actions pada knowledge items dengan better UX
 */

import React, { useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui';
import {
  CheckCircle,
  XCircle,
  Trash2,
  MoreHorizontal,
  Zap,
  Shield,
  Globe,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BULK_ACTIONS,
  DESTRUCTIVE_ACTIONS
} from './constants';

const KnowledgeBulkActions = ({ selectedCount, onAction, onClear }) => {
  const handleBulkAction = useCallback((action) => {
    if (selectedCount === 0) {
      toast.error('No items selected');
      return;
    }

    // Confirm destructive actions
    if (DESTRUCTIVE_ACTIONS.includes(action)) {
      const actionLabel = BULK_ACTIONS.find(a => a.key === action)?.label || action;
      if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} ${selectedCount} knowledge item(s)? This action cannot be undone.`)) {
        return;
      }
    }

    onAction(action);
  }, [selectedCount, onAction]);

  // Memoized components
  const SelectionInfo = useMemo(() => (
    <div className="flex items-center space-x-3">
      <Badge variant="default" className="bg-blue-600">
        {selectedCount} selected
      </Badge>
      <span className="text-sm text-gray-600">
        Bulk actions available
      </span>
    </div>
  ), [selectedCount]);

  const ActionMenuItems = useMemo(() =>
    BULK_ACTIONS.map((action, index) => {
      const isLastNonDestructive = index === BULK_ACTIONS.length - 2;
      const isDestructive = DESTRUCTIVE_ACTIONS.includes(action.key);

      return (
        <React.Fragment key={action.key}>
          {isLastNonDestructive && <DropdownMenuSeparator />}
          <DropdownMenuItem
            onClick={() => handleBulkAction(action.key)}
            className={action.className}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        </React.Fragment>
      );
    }), [handleBulkAction]
  );

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {SelectionInfo}

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ActionMenuItems}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeBulkActions;
