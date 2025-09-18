/**
 * UserForm Component
 * Form for adding or editing user details
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator
} from '@/components/ui';
import { Loader2, AlertTriangle, User, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const UserForm = ({ isOpen, onClose, user, onSave, checkEmail, checkUsername }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    phone: '',
    role: 'agent',
    password: '',
    password_confirmation: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          username: user.username || '',
          phone: user.phone || '',
          role: user.role || 'agent',
          password: '', // Don't pre-fill password for security
          password_confirmation: '',
          status: user.status || 'active'
        });
      } else {
        setFormData({
          full_name: '',
          email: '',
          username: '',
          phone: '',
          role: 'agent',
          password: '',
          password_confirmation: '',
          status: 'active'
        });
      }
      setFormErrors({});
      setApiError(null);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setFormErrors(prev => ({ ...prev, [id]: undefined })); // Clear error on change
    setApiError(null); // Clear API error on change
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
    setFormErrors(prev => ({ ...prev, role: undefined }));
    setApiError(null);
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
    setFormErrors(prev => ({ ...prev, status: undefined }));
    setApiError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Nama lengkap wajib diisi';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      errors.username = 'Username minimal 3 karakter';
    }

    if (!formData.role) {
      errors.role = 'Role wajib dipilih';
    }

    if (!formData.status) {
      errors.status = 'Status wajib dipilih';
    }

    // Password validation
    if (!user || formData.password || formData.password_confirmation) {
      if (!formData.password) {
        errors.password = 'Password wajib diisi';
      } else if (formData.password.length < 8) {
        errors.password = 'Password minimal 8 karakter';
      }

      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Konfirmasi password tidak cocok';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      toast.error('Harap perbaiki kesalahan pada formulir');
      return;
    }

    try {
      setIsSubmitting(true);

      const dataToSubmit = { ...formData };

      // Remove password fields if not provided for existing user update
      if (user && !formData.password) {
        delete dataToSubmit.password;
        delete dataToSubmit.password_confirmation;
      }

      await onSave(user ? user.id : null, dataToSubmit);
      onClose();
    } catch (err) {
      const errorMessage = handleError(err);
      setApiError(errorMessage.message);
      toast.error(`Gagal ${user ? 'memperbarui' : 'menambahkan'} pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error(`Error ${user ? 'updating' : 'creating'} user:`, err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { value: 'agent', label: 'Agent' },
    { value: 'org_admin', label: 'Organization Admin' }
  ];

  const statuses = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'pending', label: 'Menunggu' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Perbarui informasi pengguna' : 'Tambahkan pengguna baru ke dalam organisasi'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {apiError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                <CardDescription>
                  Data identitas pengguna
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={formErrors.full_name ? 'border-red-500' : ''}
                      placeholder="Masukkan nama lengkap"
                    />
                    {formErrors.full_name && (
                      <p className="text-red-500 text-xs">{formErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={formErrors.username ? 'border-red-500' : ''}
                      placeholder="Masukkan username"
                    />
                    {formErrors.username && (
                      <p className="text-red-500 text-xs">{formErrors.username}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                        placeholder="Masukkan email"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-500 text-xs">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Role dan Status</CardTitle>
                <CardDescription>
                  Tentukan role dan status pengguna
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={handleRoleChange}
                      className={formErrors.role ? 'border-red-500' : ''}
                      placeholder="Pilih Role"
                    >
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    {formErrors.role && (
                      <p className="text-red-500 text-xs">{formErrors.role}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={handleStatusChange}
                      className={formErrors.status ? 'border-red-500' : ''}
                      placeholder="Pilih Status"
                    >
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </Select>
                    {formErrors.status && (
                      <p className="text-red-500 text-xs">{formErrors.status}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password</CardTitle>
                <CardDescription>
                  {user ? 'Kosongkan jika tidak ingin mengubah password' : 'Buat password untuk pengguna'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {user ? '(Opsional)' : '*'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={formErrors.password ? 'border-red-500' : ''}
                      placeholder="Masukkan password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-500 text-xs">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={formErrors.password_confirmation ? 'border-red-500' : ''}
                      placeholder="Konfirmasi password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formErrors.password_confirmation && (
                    <p className="text-red-500 text-xs">{formErrors.password_confirmation}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? 'Simpan Perubahan' : 'Tambah Pengguna'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
