/**
 * User Management Component
 * Comprehensive user management interface for org_admin role
 */

import { useState, useCallback } from 'react';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonCard
} from '@/utils/loadingStates';
import {
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Alert,
  AlertDescription,
  Table,
  Pagination,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useToast
} from '@/components/ui';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Shield,
  Mail,
  RefreshCw,
  AlertTriangle,
  Settings,
  BarChart3
} from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserForm from './UserForm';
import UserDetails from './UserDetails';

const UserManagement = () => {
  const { toast } = useToast();
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();

  const {
    users,
    loading,
    paginationLoading,
    error,
    pagination,
    filters,
    loadUsers,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserActivity,
    getUserSessions,
    getUserPermissions,
    checkEmail,
    checkUsername,
    bulkUpdateUsers,
    updateFilters,
    updatePagination,
    handlePageChange,
    handlePerPageChange,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,
    activeUsers,
    inactiveUsers,
    totalUsers
  } = useUserManagement();

  // Local state
  const [activeTab, setActiveTab] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchUsers(query);
    } else {
      await loadUsers();
    }
  }, [searchUsers, loadUsers]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    updateFilters({ [key]: value });
  }, [updateFilters]);


  // Handle user selection
  const handleUserSelect = useCallback((user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  }, []);

  // Handle create user
  const handleCreateUser = useCallback(() => {
    setSelectedUser(null);
    setShowUserForm(true);
  }, []);

  // Handle edit user
  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setShowUserForm(true);
  }, []);

  // Handle delete user
  const handleDeleteUser = useCallback((user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  }, []);

  // Confirm delete user
  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setShowDeleteDialog(false);
      setUserToDelete(null);
      announce('Pengguna berhasil dihapus');
    } catch (error) {
      // Error handled by hook
    }
  }, [deleteUser, userToDelete, announce]);

  // Handle toggle status
  const handleToggleStatus = useCallback(async (user) => {
    try {
      await toggleUserStatus(user.id);
      announce(`Status pengguna ${user.full_name} berhasil diubah`);
    } catch (error) {
      // Error handled by hook
    }
  }, [toggleUserStatus, announce]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Pilih pengguna terlebih dahulu');
      return;
    }

    try {
      switch (action) {
        case 'activate':
          await bulkUpdateUsers({
            user_ids: selectedUsers.map(u => u.id),
            status: 'active'
          });
          break;
        case 'deactivate':
          await bulkUpdateUsers({
            user_ids: selectedUsers.map(u => u.id),
            status: 'inactive'
          });
          break;
        case 'delete':
          // Handle bulk delete
          for (const user of selectedUsers) {
            await deleteUser(user.id);
          }
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      announce(`Aksi ${action} berhasil diterapkan`);
    } catch (error) {
      // Error handled by individual operations
    }
  }, [selectedUsers, bulkUpdateUsers, deleteUser, announce, toast]);

  // Handle user selection
  const handleUserCheckboxChange = useCallback((user, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    }
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedUsers([...users]);
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-700">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Tidak Aktif</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Menunggu</Badge>;
      default:
        return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
  };

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'org_admin':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Admin</Badge>;
      case 'agent':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Agent</Badge>;
      default:
        return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
  };

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Kelola pengguna dan izin dalam organisasi Anda
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => loadUsers()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Semua pengguna dalam organisasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Pengguna yang aktif saat ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Pengguna yang tidak aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'org_admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pengguna dengan akses admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Daftar Pengguna
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        {/* Users List Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>
                    Kelola semua pengguna dalam organisasi Anda
                  </CardDescription>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedUsers.length} dipilih
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('activate')}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Aktifkan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('deactivate')}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Nonaktifkan
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Cari pengguna..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                  className="w-40"
                >
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                </Select>

                <Select
                  value={filters.role}
                  onValueChange={(value) => handleFilterChange('role', value)}
                  className="w-40"
                >
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="org_admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </Select>
              </div>

              {/* Users Table */}
              <LoadingWrapper
                isLoading={loading}
                loadingComponent={<SkeletonCard />}
              >
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Pengguna</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Terakhir Aktif</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedUsers.some(u => u.id === user.id)}
                              onChange={(e) => handleUserCheckboxChange(user, e.target.checked)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>
                                  {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            {user.last_active_at ? formatDate(user.last_active_at) : 'Tidak pernah'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUserSelect(user)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Nonaktifkan
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Aktifkan
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </LoadingWrapper>

              {/* Enhanced Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    perPage={pagination.perPage}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                    onFirstPage={goToFirstPage}
                    onLastPage={goToLastPage}
                    onPrevPage={goToPreviousPage}
                    onNextPage={goToNextPage}
                    variant="table"
                    size="sm"
                    loading={paginationLoading}
                    showPerPageSelector={true}
                    showPageInfo={true}
                    showFirstLast={true}
                    showPrevNext={true}
                    showPageNumbers={true}
                    perPageOptions={[5, 10, 15, 25, 50]}
                    maxVisiblePages={5}
                    ariaLabel="Users table pagination"
                    className="border-t pt-4"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Pengguna</CardTitle>
              <CardDescription>
                Analisis dan statistik pengguna dalam organisasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Statistik Pengguna</h3>
                <p className="text-muted-foreground">
                  Fitur statistik akan segera tersedia
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan User Management</CardTitle>
              <CardDescription>
                Konfigurasi pengaturan untuk manajemen pengguna
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Pengaturan User Management</h3>
                  <p className="text-muted-foreground">
                    Fitur pengaturan akan segera tersedia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Form Dialog */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        user={selectedUser}
        onSave={selectedUser ? updateUser : createUser}
        checkEmail={checkEmail}
        checkUsername={checkUsername}
      />

      {/* User Details Dialog */}
      <UserDetails
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        getUserActivity={getUserActivity}
        getUserSessions={getUserSessions}
        getUserPermissions={getUserPermissions}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna <strong>{userToDelete?.full_name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UserManagementWithErrorHandling = withErrorHandling(UserManagement);
export default UserManagementWithErrorHandling;
