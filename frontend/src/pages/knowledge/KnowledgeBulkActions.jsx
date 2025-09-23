/**
 * Knowledge Bulk Actions Component
 * Component untuk bulk actions pada knowledge items
 */

import React from 'react';
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

const KnowledgeBulkActions = ({ selectedCount, onAction, onClear }) => {
  const handleBulkAction = (action) => {
    if (selectedCount === 0) {
      toast.error('No items selected');
      return;
    }

    // Confirm destructive actions
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedCount} knowledge item(s)? This action cannot be undone.`)) {
        return;
      }
    }

    onAction(action);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="default" className="bg-blue-600">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-gray-600">
              Bulk actions available
            </span>
          </div>

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

                <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Publish Selected
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleBulkAction('draft')}>
                  <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                  Move to Draft
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleBulkAction('make_public')}>
                  <Globe className="mr-2 h-4 w-4 text-blue-600" />
                  Make Public
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleBulkAction('make_private')}>
                  <Shield className="mr-2 h-4 w-4 text-gray-600" />
                  Make Private
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
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
