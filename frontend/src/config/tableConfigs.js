/**
 * Table Configurations
 * Centralized table configurations untuk berbagai modul
 */

export const USER_TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sortable: true,
      type: 'number'
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
      type: 'email'
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'admin' ? 'default' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'active' ? 'success' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'created_at',
      title: 'Created At',
      dataIndex: 'created_at',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY HH:mm'
    }
  ],
  actions: [
    {
      key: 'view',
      label: 'View',
      icon: 'Eye',
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'Edit',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'Trash2',
      variant: 'destructive'
    }
  ],
  searchable: true,
  filterable: true,
  sortable: true,
  selectable: true,
  pagination: true
};

export const ORGANIZATION_TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sortable: true,
      type: 'number'
    },
    {
      key: 'name',
      title: 'Organization Name',
      dataIndex: 'name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'code',
      title: 'Code',
      dataIndex: 'code',
      sortable: true,
      type: 'text'
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
      type: 'email'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'active' ? 'success' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'subscription',
      title: 'Subscription',
      dataIndex: 'subscription.plan_name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'created_at',
      title: 'Created At',
      dataIndex: 'created_at',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY HH:mm'
    }
  ],
  actions: [
    {
      key: 'view',
      label: 'View',
      icon: 'Eye',
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'Edit',
    },
    {
      key: 'users',
      label: 'Users',
      icon: 'Users',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'Trash2',
      variant: 'destructive'
    }
  ],
  searchable: true,
  filterable: true,
  sortable: true,
  selectable: true,
  pagination: true
};

export const SUBSCRIPTION_TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sortable: true,
      type: 'number'
    },
    {
      key: 'organization',
      title: 'Organization',
      dataIndex: 'organization.name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'plan',
      title: 'Plan',
      dataIndex: 'plan.name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'active' ? 'success' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'billing_cycle',
      title: 'Billing Cycle',
      dataIndex: 'billing_cycle',
      sortable: true,
      type: 'text'
    },
    {
      key: 'amount',
      title: 'Amount',
      dataIndex: 'amount',
      sortable: true,
      type: 'currency',
      currency: 'IDR'
    },
    {
      key: 'start_date',
      title: 'Start Date',
      dataIndex: 'start_date',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY'
    },
    {
      key: 'end_date',
      title: 'End Date',
      dataIndex: 'end_date',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY'
    }
  ],
  actions: [
    {
      key: 'view',
      label: 'View',
      icon: 'Eye',
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'Edit',
    },
    {
      key: 'billing',
      label: 'Billing',
      icon: 'CreditCard',
    },
    {
      key: 'cancel',
      label: 'Cancel',
      icon: 'X',
      variant: 'destructive'
    }
  ],
  searchable: true,
  filterable: true,
  sortable: true,
  selectable: true,
  pagination: true
};

export const CHATBOT_TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sortable: true,
      type: 'number'
    },
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'description',
      title: 'Description',
      dataIndex: 'description',
      sortable: false,
      type: 'text',
      render: (value) => ({
        type: 'truncate',
        props: {
          text: value,
          maxLength: 50
        }
      })
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'active' ? 'success' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'conversations_count',
      title: 'Conversations',
      dataIndex: 'conversations_count',
      sortable: true,
      type: 'number'
    },
    {
      key: 'created_at',
      title: 'Created At',
      dataIndex: 'created_at',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY HH:mm'
    }
  ],
  actions: [
    {
      key: 'view',
      label: 'View',
      icon: 'Eye',
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'Edit',
    },
    {
      key: 'test',
      label: 'Test',
      icon: 'Play',
    },
    {
      key: 'train',
      label: 'Train',
      icon: 'Brain',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'Trash2',
      variant: 'destructive'
    }
  ],
  searchable: true,
  filterable: true,
  sortable: true,
  selectable: true,
  pagination: true
};

export const CONVERSATION_TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sortable: true,
      type: 'number'
    },
    {
      key: 'user',
      title: 'User',
      dataIndex: 'user.name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'chatbot',
      title: 'Chatbot',
      dataIndex: 'chatbot.name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'active' ? 'success' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'messages_count',
      title: 'Messages',
      dataIndex: 'messages_count',
      sortable: true,
      type: 'number'
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration',
      sortable: true,
      type: 'text'
    },
    {
      key: 'created_at',
      title: 'Started At',
      dataIndex: 'created_at',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY HH:mm'
    }
  ],
  actions: [
    {
      key: 'view',
      label: 'View',
      icon: 'Eye',
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: 'MessageCircle',
    },
    {
      key: 'export',
      label: 'Export',
      icon: 'Download',
    }
  ],
  searchable: true,
  filterable: true,
  sortable: true,
  selectable: true,
  pagination: true
};

export const PAYMENT_TABLE_CONFIG = {
  columns: [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sortable: true,
      type: 'number'
    },
    {
      key: 'organization',
      title: 'Organization',
      dataIndex: 'organization.name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'subscription',
      title: 'Subscription',
      dataIndex: 'subscription.plan_name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'amount',
      title: 'Amount',
      dataIndex: 'amount',
      sortable: true,
      type: 'currency',
      currency: 'IDR'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      type: 'status',
      render: (value) => ({
        type: 'badge',
        props: {
          variant: value === 'completed' ? 'success' : 'secondary',
          children: value
        }
      })
    },
    {
      key: 'payment_method',
      title: 'Payment Method',
      dataIndex: 'payment_method',
      sortable: true,
      type: 'text'
    },
    {
      key: 'created_at',
      title: 'Created At',
      dataIndex: 'created_at',
      sortable: true,
      type: 'date',
      dateFormat: 'DD/MM/YYYY HH:mm'
    }
  ],
  actions: [
    {
      key: 'view',
      label: 'View',
      icon: 'Eye',
    },
    {
      key: 'refund',
      label: 'Refund',
      icon: 'RotateCcw',
      variant: 'destructive'
    }
  ],
  searchable: true,
  filterable: true,
  sortable: true,
  selectable: true,
  pagination: true
};

export default {
  USER_TABLE_CONFIG,
  ORGANIZATION_TABLE_CONFIG,
  SUBSCRIPTION_TABLE_CONFIG,
  CHATBOT_TABLE_CONFIG,
  CONVERSATION_TABLE_CONFIG,
  PAYMENT_TABLE_CONFIG
};
