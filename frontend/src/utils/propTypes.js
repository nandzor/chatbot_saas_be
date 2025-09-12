/**
 * PropTypes Definitions
 * Definisi PropTypes yang dapat digunakan kembali di seluruh aplikasi
 */

import PropTypes from 'prop-types';

/**
 * Common PropTypes
 */
export const CommonPropTypes = {
  // Basic types
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,

  // UI States
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.bool]),

  // Event handlers
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  onSuccess: PropTypes.func,

  // Size and variants
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']),

  // Data types
  title: PropTypes.string,
  description: PropTypes.string,
  content: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  label: PropTypes.string,
  placeholder: PropTypes.string,

  // API related
  data: PropTypes.array,
  item: PropTypes.object,
  items: PropTypes.array,
  response: PropTypes.object,

  // Pagination
  page: PropTypes.number,
  perPage: PropTypes.number,
  total: PropTypes.number,
  totalPages: PropTypes.number,

  // Filters and sorting
  filters: PropTypes.object,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(['asc', 'desc']),

  // Navigation
  route: PropTypes.string,
  params: PropTypes.object,
  query: PropTypes.object,
};

/**
 * User PropTypes
 */
export const UserPropTypes = {
  user: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.oneOf(['active', 'inactive', 'suspended']),
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    last_login_at: PropTypes.string,
  }),

  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

/**
 * Organization PropTypes
 */
export const OrganizationPropTypes = {
  organization: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    description: PropTypes.string,
    logo: PropTypes.string,
    website: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.oneOf(['active', 'inactive', 'suspended']),
    subscription_plan: PropTypes.string,
    users_count: PropTypes.number,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),

  organizations: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string,
      users_count: PropTypes.number,
    })
  ),
};

/**
 * Subscription PropTypes
 */
export const SubscriptionPropTypes = {
  subscription: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    plan_id: CommonPropTypes.id.isRequired,
    organization_id: CommonPropTypes.id.isRequired,
    status: PropTypes.oneOf(['active', 'inactive', 'cancelled', 'expired', 'trial']),
    starts_at: PropTypes.string,
    ends_at: PropTypes.string,
    trial_ends_at: PropTypes.string,
    cancelled_at: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    plan: PropTypes.object,
    organization: PropTypes.object,
  }),

  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      status: PropTypes.string.isRequired,
      plan: PropTypes.object,
      organization: PropTypes.object,
    })
  ),

  subscriptionPlan: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    billing_cycle: PropTypes.oneOf(['monthly', 'yearly']),
    features: PropTypes.array,
    limits: PropTypes.object,
    is_popular: PropTypes.bool,
    is_active: PropTypes.bool,
  }),
};

/**
 * Chatbot PropTypes
 */
export const ChatbotPropTypes = {
  chatbot: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.oneOf(['active', 'inactive', 'training']),
    language: PropTypes.string,
    personality: PropTypes.string,
    knowledge_base: PropTypes.array,
    settings: PropTypes.object,
    organization_id: CommonPropTypes.id.isRequired,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),

  chatbots: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string,
    })
  ),
};

/**
 * Conversation PropTypes
 */
export const ConversationPropTypes = {
  conversation: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    chatbot_id: CommonPropTypes.id.isRequired,
    user_id: CommonPropTypes.id,
    session_id: PropTypes.string,
    status: PropTypes.oneOf(['active', 'ended', 'transferred']),
    started_at: PropTypes.string,
    ended_at: PropTypes.string,
    messages_count: PropTypes.number,
    satisfaction_rating: PropTypes.number,
    tags: PropTypes.array,
  }),

  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      status: PropTypes.string,
      started_at: PropTypes.string,
      messages_count: PropTypes.number,
    })
  ),

  message: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    conversation_id: CommonPropTypes.id.isRequired,
    sender_type: PropTypes.oneOf(['user', 'bot', 'agent']),
    content: PropTypes.string.isRequired,
    message_type: PropTypes.oneOf(['text', 'image', 'file', 'quick_reply']),
    metadata: PropTypes.object,
    sent_at: PropTypes.string.isRequired,
  }),
};

/**
 * Payment PropTypes
 */
export const PaymentPropTypes = {
  payment: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    subscription_id: CommonPropTypes.id.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
    payment_method: PropTypes.string,
    payment_gateway: PropTypes.string,
    gateway_transaction_id: PropTypes.string,
    processed_at: PropTypes.string,
    failed_at: PropTypes.string,
    created_at: PropTypes.string,
  }),

  payments: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      amount: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      processed_at: PropTypes.string,
    })
  ),
};

/**
 * Analytics PropTypes
 */
export const AnalyticsPropTypes = {
  analytics: PropTypes.shape({
    period: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    summary: PropTypes.object,
    metrics: PropTypes.object,
  }),

  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string,
    })
  ),

  kpiData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    change: PropTypes.number,
    trend: PropTypes.oneOf(['up', 'down', 'stable']),
    format: PropTypes.oneOf(['number', 'currency', 'percentage']),
  }),
};

/**
 * Table PropTypes
 */
export const TablePropTypes = {
  column: PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    dataIndex: PropTypes.string,
    render: PropTypes.func,
    sortable: PropTypes.bool,
    filterable: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    align: PropTypes.oneOf(['left', 'center', 'right']),
  }),

  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),

  pagination: PropTypes.shape({
    current: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number,
    showSizeChanger: PropTypes.bool,
    showQuickJumper: PropTypes.bool,
    showTotal: PropTypes.func,
  }),

  sorter: PropTypes.shape({
    field: PropTypes.string,
    order: PropTypes.oneOf(['ascend', 'descend']),
  }),

  filters: PropTypes.object,
};

/**
 * Form PropTypes
 */
export const FormPropTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'select', 'textarea', 'checkbox', 'radio', 'file']),
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    options: PropTypes.array,
    validation: PropTypes.object,
  }),

  formData: PropTypes.object,
  formErrors: PropTypes.object,
  formTouched: PropTypes.object,

  validation: PropTypes.shape({
    required: PropTypes.bool,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    pattern: PropTypes.instanceOf(RegExp),
    custom: PropTypes.func,
  }),
};

/**
 * Modal PropTypes
 */
export const ModalPropTypes = {
  modal: PropTypes.shape({
    open: PropTypes.bool.isRequired,
    title: PropTypes.string,
    content: PropTypes.node,
    footer: PropTypes.node,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    closable: PropTypes.bool,
    maskClosable: PropTypes.bool,
    keyboard: PropTypes.bool,
    centered: PropTypes.bool,
    onClose: PropTypes.func,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
  }),
};

/**
 * Notification PropTypes
 */
export const NotificationPropTypes = {
  notification: PropTypes.shape({
    id: CommonPropTypes.id.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    duration: PropTypes.number,
    closable: PropTypes.bool,
    actions: PropTypes.array,
    created_at: PropTypes.string,
  }),

  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: CommonPropTypes.id.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
};

/**
 * Route PropTypes
 */
export const RoutePropTypes = {
  route: PropTypes.shape({
    path: PropTypes.string.isRequired,
    component: PropTypes.elementType.isRequired,
    exact: PropTypes.bool,
    protected: PropTypes.bool,
    roles: PropTypes.array,
    permissions: PropTypes.array,
    redirect: PropTypes.string,
  }),

  routeParams: PropTypes.object,
  routeQuery: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  match: PropTypes.object,
};

/**
 * Theme PropTypes
 */
export const ThemePropTypes = {
  theme: PropTypes.shape({
    mode: PropTypes.oneOf(['light', 'dark']),
    primaryColor: PropTypes.string,
    secondaryColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    borderColor: PropTypes.string,
  }),
};

/**
 * Export all PropTypes
 */
export default {
  CommonPropTypes,
  UserPropTypes,
  OrganizationPropTypes,
  SubscriptionPropTypes,
  ChatbotPropTypes,
  ConversationPropTypes,
  PaymentPropTypes,
  AnalyticsPropTypes,
  TablePropTypes,
  FormPropTypes,
  ModalPropTypes,
  NotificationPropTypes,
  RoutePropTypes,
  ThemePropTypes,
};
