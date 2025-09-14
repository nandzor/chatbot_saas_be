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

const EditRoleDialog = ({ open, onOpenChange, role, onRoleUpdated }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData) => {
    if (!role?.id) return;

    try {
      setSubmitting(true);
      const response = await roleManagementService.updateRole(role.id, formData);

      if (response.success) {
        toast.success('Role updated successfully');
        onRoleUpdated?.(response.data);
        onOpenChange?.(false);
      } else {
        toast.error(response.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  }, [role?.id, onRoleUpdated, onOpenChange]);

  const handleClose = useCallback(() => {
    if (!submitting) {
      onOpenChange?.(false);
    }
  }, [submitting, onOpenChange]);

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Edit Role: {role.name}</span>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Update role settings, permissions, and other configurations.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <RoleForm
            role={role}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            submitting={submitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
