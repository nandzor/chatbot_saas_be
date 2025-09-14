import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm, permission, loading = false }) => {
  const handleConfirm = () => {
    onConfirm?.(permission);
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Permission
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the permission "{permission?.name}"?
            <br />
            <br />
            <strong>This action cannot be undone</strong> and will remove the permission from all roles and users.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="destructive"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permission'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
