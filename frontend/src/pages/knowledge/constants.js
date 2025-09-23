/**
 * Shared constants for Knowledge components
 * Centralized constants untuk menghindari duplikasi dan memudahkan maintenance
 */

// Form constants
export const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  content: '',
  content_type: 'article',
  category_id: '',
  priority: 'medium',
  tags: [],
  language: 'en',
  is_public: true,
  requires_approval: false,
  workflow_status: 'draft'
};

export const INITIAL_QA_ITEM = { question: '', answer: '' };

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' }
];

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' }
];

// Tag suggestions
export const TAG_SUGGESTIONS = [
  'FAQ', 'Pembayaran', 'Akun', 'Produk', 'Layanan', 'Cara', 'Panduan', 'Informasi'
];

// Status configuration
export const STATUS_CONFIG = {
  published: {
    variant: 'default',
    icon: 'CheckCircle',
    label: 'Published'
  },
  draft: {
    variant: 'secondary',
    icon: 'Clock',
    label: 'Draft'
  }
};

// Priority configuration
export const PRIORITY_CONFIG = {
  low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Low' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
  high: { color: 'text-red-600', bg: 'bg-red-100', label: 'High' }
};

// Filter constants
export const INITIAL_FILTERS = {
  status: 'all',
  type: 'all'
};

// Statistics cards configuration
export const STATS_CARDS_CONFIG = [
  {
    title: 'Total Items',
    icon: 'BookOpen',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    key: 'total'
  },
  {
    title: 'Published',
    icon: 'CheckCircle',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    key: 'published'
  },
  {
    title: 'Drafts',
    icon: 'Clock',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    key: 'drafts'
  },
  {
    title: 'Categories',
    icon: 'Tag',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    key: 'categories'
  }
];

// Bulk actions configuration
export const BULK_ACTIONS = [
  {
    key: 'publish',
    label: 'Publish Selected',
    icon: 'CheckCircle',
    className: 'text-green-600'
  },
  {
    key: 'draft',
    label: 'Move to Draft',
    icon: 'Clock',
    className: 'text-yellow-600'
  },
  {
    key: 'make_public',
    label: 'Make Public',
    icon: 'Globe',
    className: 'text-blue-600'
  },
  {
    key: 'make_private',
    label: 'Make Private',
    icon: 'Shield',
    className: 'text-gray-600'
  },
  {
    key: 'delete',
    label: 'Delete Selected',
    icon: 'Trash2',
    className: 'text-red-600 focus:text-red-600'
  }
];

export const DESTRUCTIVE_ACTIONS = ['delete'];
