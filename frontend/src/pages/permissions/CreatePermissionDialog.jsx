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

const CreatePermissionDialog = ({ open, onOpenChange, onSubmit, loading = false }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData) => {
    try {
      setSubmitting(true);
      const response = await permissionManagementService.createPermission(formData);

      if (response.success) {
        toast.success('Permission created successfully');
        onSubmit?.(response.data);
        onOpenChange?.(false);
      } else {
        toast.error(response.message || 'Failed to create permission');
      }
    } catch (error) {
      console.error('Create permission error:', error);
      toast.error(error.message || 'Failed to create permission');
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!submitting) {
      onOpenChange?.(false);
    }
  }, [submitting, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Create New Permission</span>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Create a new permission with specific settings and configurations.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <PermissionForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitting={submitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePermissionDialog;
