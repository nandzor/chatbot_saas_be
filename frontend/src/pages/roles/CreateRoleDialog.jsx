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
import { roleManagementService } from '@/services/RoleManagementService';
import { toast } from 'react-hot-toast';
import RoleForm from './RoleForm';

const CreateRoleDialog = ({ open, onOpenChange, onRoleCreated }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData) => {
    try {
      setSubmitting(true);
      const response = await roleManagementService.createRole(formData);

      if (response.success) {
        toast.success('Role created successfully');
        onRoleCreated?.(response.data);
        onOpenChange?.(false);
      } else {
        toast.error(response.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Create role error:', error);
      toast.error(error.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  }, [onRoleCreated, onOpenChange]);

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
            <span>Create New Role</span>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <RoleForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitting={submitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleDialog;
