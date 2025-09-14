import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { X, Loader2 } from 'lucide-react';
import { permissionManagementService } from '@/services/PermissionManagementService';
import { toast } from 'react-hot-toast';
import PermissionForm from './PermissionForm';

const EditPermissionDialog = ({ open, onOpenChange, permission, onSubmit, loading = false }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData) => {
    if (!permission?.id) return;

    try {
      setSubmitting(true);
      const response = await permissionManagementService.updatePermission(permission.id, formData);

      if (response.success) {
        toast.success('Permission updated successfully');
        onSubmit?.(response.data);
        onOpenChange?.(false);
      } else {
        toast.error(response.message || 'Failed to update permission');
      }
    } catch (error) {
      console.error('Update permission error:', error);
      toast.error(error.message || 'Failed to update permission');
    } finally {
      setSubmitting(false);
    }
  }, [permission?.id, onSubmit, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!submitting) {
      onOpenChange?.(false);
    }
  }, [submitting, onOpenChange]);

  if (!permission) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Edit Permission: {permission.name}</span>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Update permission settings and configurations.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <PermissionForm
            permission={permission}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitting={submitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPermissionDialog;
