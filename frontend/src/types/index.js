/**
 * Type Definitions
 * Definisi types yang dapat digunakan di seluruh aplikasi (JSDoc style)
 */

/**
 * @typedef {Object} User
 * @property {string|number} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} [role] - User role
 * @property {string} [avatar] - User avatar URL
 * @property {'active'|'inactive'|'suspended'} [status] - User status
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Update timestamp
 * @property {string} [last_login_at] - Last login timestamp
 */

/**
 * @typedef {Object} Organization
 * @property {string|number} id - Organization ID
 * @property {string} name - Organization name
 * @property {string} [slug] - Organization slug
 * @property {string} [description] - Organization description
 * @property {string} [logo] - Organization logo URL
 * @property {string} [website] - Organization website
 * @property {string} [email] - Organization email
 * @property {string} [phone] - Organization phone
 * @property {string} [address] - Organization address
 * @property {'active'|'inactive'|'suspended'} [status] - Organization status
 * @property {string} [subscription_plan] - Subscription plan
 * @property {number} [users_count] - Number of users
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Update timestamp
 */

/**
 * @typedef {Object} Subscription
 * @property {string|number} id - Subscription ID
 * @property {string|number} plan_id - Plan ID
 * @property {string|number} organization_id - Organization ID
 * @property {'active'|'inactive'|'cancelled'|'expired'|'trial'} status - Subscription status
 * @property {string} [starts_at] - Start timestamp
 * @property {string} [ends_at] - End timestamp
 * @property {string} [trial_ends_at] - Trial end timestamp
 * @property {string} [cancelled_at] - Cancellation timestamp
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Update timestamp
 * @property {Object} [plan] - Subscription plan details
 * @property {Object} [organization] - Organization details
 */

/**
 * @typedef {Object} SubscriptionPlan
 * @property {string|number} id - Plan ID
 * @property {string} name - Plan name
 * @property {string} [description] - Plan description
 * @property {number} price - Plan price
 * @property {'monthly'|'yearly'} [billing_cycle] - Billing cycle
 * @property {Array} [features] - Plan features
 * @property {Object} [limits] - Plan limits
 * @property {boolean} [is_popular] - Is popular plan
 * @property {boolean} [is_active] - Is active plan
 */

/**
 * @typedef {Object} Chatbot
 * @property {string|number} id - Chatbot ID
 * @property {string} name - Chatbot name
 * @property {string} [description] - Chatbot description
 * @property {string} [avatar] - Chatbot avatar URL
 * @property {'active'|'inactive'|'training'} [status] - Chatbot status
 * @property {string} [language] - Chatbot language
 * @property {string} [personality] - Chatbot personality
 * @property {Array} [knowledge_base] - Knowledge base
 * @property {Object} [settings] - Chatbot settings
 * @property {string|number} organization_id - Organization ID
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Update timestamp
 */

/**
 * @typedef {Object} Conversation
 * @property {string|number} id - Conversation ID
 * @property {string|number} chatbot_id - Chatbot ID
 * @property {string|number} [user_id] - User ID
 * @property {string} [session_id] - Session ID
 * @property {'active'|'ended'|'transferred'} [status] - Conversation status
 * @property {string} [started_at] - Start timestamp
 * @property {string} [ended_at] - End timestamp
 * @property {number} [messages_count] - Number of messages
 * @property {number} [satisfaction_rating] - Satisfaction rating
 * @property {Array} [tags] - Conversation tags
 */

/**
 * @typedef {Object} Message
 * @property {string|number} id - Message ID
 * @property {string|number} conversation_id - Conversation ID
 * @property {'user'|'bot'|'agent'} sender_type - Sender type
 * @property {string} content - Message content
 * @property {'text'|'image'|'file'|'quick_reply'} [message_type] - Message type
 * @property {Object} [metadata] - Message metadata
 * @property {string} sent_at - Send timestamp
 */

/**
 * @typedef {Object} Payment
 * @property {string|number} id - Payment ID
 * @property {string|number} subscription_id - Subscription ID
 * @property {number} amount - Payment amount
 * @property {string} currency - Payment currency
 * @property {'pending'|'processing'|'completed'|'failed'|'cancelled'|'refunded'} status - Payment status
 * @property {string} [payment_method] - Payment method
 * @property {string} [payment_gateway] - Payment gateway
 * @property {string} [gateway_transaction_id] - Gateway transaction ID
 * @property {string} [processed_at] - Processing timestamp
 * @property {string} [failed_at] - Failure timestamp
 * @property {string} [created_at] - Creation timestamp
 */

/**
 * @typedef {Object} Analytics
 * @property {string} period - Analytics period
 * @property {Array} data - Analytics data
 * @property {Object} [summary] - Analytics summary
 * @property {Object} [metrics] - Analytics metrics
 */

/**
 * @typedef {Object} ChartData
 * @property {string} label - Data label
 * @property {number} value - Data value
 * @property {string} [color] - Data color
 */

/**
 * @typedef {Object} KPIData
 * @property {string} title - KPI title
 * @property {string|number} value - KPI value
 * @property {number} [change] - KPI change
 * @property {'up'|'down'|'stable'} [trend] - KPI trend
 * @property {'number'|'currency'|'percentage'} [format] - Value format
 */

/**
 * @typedef {Object} TableColumn
 * @property {string} key - Column key
 * @property {string} title - Column title
 * @property {string} [dataIndex] - Data index
 * @property {Function} [render] - Render function
 * @property {boolean} [sortable] - Is sortable
 * @property {boolean} [filterable] - Is filterable
 * @property {string|number} [width] - Column width
 * @property {'left'|'center'|'right'} [align] - Column alignment
 */

/**
 * @typedef {Object} Pagination
 * @property {number} [current] - Current page
 * @property {number} [pageSize] - Page size
 * @property {number} [total] - Total items
 * @property {boolean} [showSizeChanger] - Show size changer
 * @property {boolean} [showQuickJumper] - Show quick jumper
 * @property {Function} [showTotal] - Show total function
 */

/**
 * @typedef {Object} Sorter
 * @property {string} [field] - Sort field
 * @property {'ascend'|'descend'} [order] - Sort order
 */

/**
 * @typedef {Object} FormField
 * @property {string} name - Field name
 * @property {string} [label] - Field label
 * @property {'text'|'email'|'password'|'number'|'select'|'textarea'|'checkbox'|'radio'|'file'} [type] - Field type
 * @property {string} [placeholder] - Field placeholder
 * @property {boolean} [required] - Is required
 * @property {boolean} [disabled] - Is disabled
 * @property {Array} [options] - Field options
 * @property {Object} [validation] - Field validation
 */

/**
 * @typedef {Object} Validation
 * @property {boolean} [required] - Is required
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 * @property {RegExp} [pattern] - Validation pattern
 * @property {Function} [custom] - Custom validation
 */

/**
 * @typedef {Object} Modal
 * @property {boolean} open - Is modal open
 * @property {string} [title] - Modal title
 * @property {React.ReactNode} [content] - Modal content
 * @property {React.ReactNode} [footer] - Modal footer
 * @property {'sm'|'md'|'lg'|'xl'|'full'} [size] - Modal size
 * @property {boolean} [closable] - Is closable
 * @property {boolean} [maskClosable] - Is mask closable
 * @property {boolean} [keyboard] - Is keyboard closable
 * @property {boolean} [centered] - Is centered
 * @property {Function} [onClose] - Close handler
 * @property {Function} [onCancel] - Cancel handler
 * @property {Function} [onOk] - OK handler
 */

/**
 * @typedef {Object} Notification
 * @property {string|number} id - Notification ID
 * @property {'success'|'error'|'warning'|'info'} type - Notification type
 * @property {string} title - Notification title
 * @property {string} [message] - Notification message
 * @property {number} [duration] - Display duration
 * @property {boolean} [closable] - Is closable
 * @property {Array} [actions] - Notification actions
 * @property {string} [created_at] - Creation timestamp
 */

/**
 * @typedef {Object} Route
 * @property {string} path - Route path
 * @property {React.ComponentType} component - Route component
 * @property {boolean} [exact] - Exact path match
 * @property {boolean} [protected] - Is protected route
 * @property {Array} [roles] - Required roles
 * @property {Array} [permissions] - Required permissions
 * @property {string} [redirect] - Redirect path
 */

/**
 * @typedef {Object} Theme
 * @property {'light'|'dark'} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color
 * @property {string} [secondaryColor] - Secondary color
 * @property {string} [backgroundColor] - Background color
 * @property {string} [textColor] - Text color
 * @property {string} [borderColor] - Border color
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success
 * @property {*} [data] - Response data
 * @property {string} [message] - Response message
 * @property {Object} [error] - Error details
 * @property {Object} [meta] - Response metadata
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success - Request success
 * @property {Array} data - Response data
 * @property {Object} meta - Pagination metadata
 * @property {number} meta.current_page - Current page
 * @property {number} meta.last_page - Last page
 * @property {number} meta.per_page - Items per page
 * @property {number} meta.total - Total items
 */

/**
 * @typedef {Object} LoadingState
 * @property {boolean} [isLoading] - General loading
 * @property {boolean} [isRefreshing] - Refreshing data
 * @property {boolean} [isSubmitting] - Submitting form
 * @property {boolean} [isDeleting] - Deleting item
 * @property {boolean} [isUpdating] - Updating item
 */

/**
 * @typedef {Object} ErrorState
 * @property {Error|string|null} error - Error object or message
 * @property {string|null} [errorInfo] - Additional error info
 * @property {string|null} [errorId] - Error ID for tracking
 * @property {number} [timestamp] - Error timestamp
 */

// Export types for use in other files
export default {
  // Models
  User: /** @type {User} */ ({}),
  Organization: /** @type {Organization} */ ({}),
  Subscription: /** @type {Subscription} */ ({}),
  SubscriptionPlan: /** @type {SubscriptionPlan} */ ({}),
  Chatbot: /** @type {Chatbot} */ ({}),
  Conversation: /** @type {Conversation} */ ({}),
  Message: /** @type {Message} */ ({}),
  Payment: /** @type {Payment} */ ({}),
  
  // Analytics
  Analytics: /** @type {Analytics} */ ({}),
  ChartData: /** @type {ChartData} */ ({}),
  KPIData: /** @type {KPIData} */ ({}),
  
  // UI
  TableColumn: /** @type {TableColumn} */ ({}),
  Pagination: /** @type {Pagination} */ ({}),
  Sorter: /** @type {Sorter} */ ({}),
  FormField: /** @type {FormField} */ ({}),
  Validation: /** @type {Validation} */ ({}),
  Modal: /** @type {Modal} */ ({}),
  Notification: /** @type {Notification} */ ({}),
  Route: /** @type {Route} */ ({}),
  Theme: /** @type {Theme} */ ({}),
  
  // API
  ApiResponse: /** @type {ApiResponse} */ ({}),
  PaginatedResponse: /** @type {PaginatedResponse} */ ({}),
  
  // States
  LoadingState: /** @type {LoadingState} */ ({}),
  ErrorState: /** @type {ErrorState} */ ({}),
};
