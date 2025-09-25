import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Input,
  Badge,
  Select,
  SelectItem,
  SelectValue,
  DataTable
} from '@/components/ui';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Clock,
  Star,
  RefreshCw
} from 'lucide-react';

const AgentDatatable = ({
  agents = [],
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  loading = false,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Handle selection
  const handleSelectionChange = useCallback((selectedItems) => {
    setSelectedAgents(selectedItems);
  }, []);

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedAgents(agents.map(agent => agent.id));
    } else {
      setSelectedAgents([]);
    }
  }, [agents]);

  // DataTable columns configuration
  const columns = useMemo(() => [
    {
      key: 'agent',
      title: 'Agent',
      sortable: true,
      render: (value, agent) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {agent.display_name?.charAt(0) || agent.user?.email?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center space-x-2">
              {agent.display_name || 'Unnamed Agent'}
            </div>
            <div className="text-sm text-gray-500">{agent.agent_code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      sortable: true,
      render: (value, agent) => (
        <div>
          <div className="text-sm">{agent.user?.email}</div>
          <div className="text-sm text-gray-500">
            {agent.user?.phone || 'No phone'}
          </div>
        </div>
      )
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: (value, agent) => (
        <div className="text-sm">
          {agent.department || 'No department'}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value, agent) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(agent.status)}
          {getStatusBadge(agent.status)}
        </div>
      )
    },
    {
      key: 'availability',
      title: 'Availability',
      sortable: true,
      render: (value, agent) => getAvailabilityBadge(agent.availability_status)
    },
    {
      key: 'performance',
      title: 'Performance',
      sortable: true,
      render: (value, agent) => (
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">
            {agent.rating || '0.0'}/5.0
          </span>
        </div>
      )
    }
  ], []);

  // Actions configuration
  const actions = useMemo(() => [
    {
      key: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: (agent) => onView?.(agent),
      className: 'text-blue-600'
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (agent) => onEdit?.(agent),
      className: 'text-green-600'
    },
    {
      key: 'status',
      label: (agent) => agent.status === 'active' ? 'Deactivate' : 'Activate',
      icon: (agent) => agent.status === 'active' ? UserX : UserCheck,
      onClick: (agent) => onStatusChange?.(agent, agent.status === 'active' ? 'inactive' : 'active'),
      className: 'text-orange-600'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: (agent) => onDelete?.(agent.id),
      className: 'text-red-600'
    }
  ], [onView, onEdit, onStatusChange, onDelete]);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availability) => {
    const variants = {
      available: 'default',
      busy: 'secondary',
      away: 'outline',
      offline: 'destructive',
    };
    return (
      <Badge variant={variants[availability] || 'secondary'}>
        {availability}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <UserX className="h-4 w-4 text-gray-500" />;
      case 'suspended':
        return <UserX className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectValue placeholder="Status" />
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </Select>

        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectValue placeholder="Availability" />
          <SelectItem value="all">All Availability</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="busy">Busy</SelectItem>
          <SelectItem value="away">Away</SelectItem>
          <SelectItem value="offline">Offline</SelectItem>
        </Select>

        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        data={agents}
        columns={columns}
        actions={actions}
        loading={loading}
        searchable={false}
        ariaLabel="Agents management table"
        pagination={null}
        selectable={true}
        selectedItems={selectedAgents}
        onSelectionChange={handleSelectionChange}
        selectAll={selectAll}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
};

export default AgentDatatable;
