import { CURRENCY } from '@/config/constants';

// Currency formatting (Indonesian Rupiah)
export const formatCurrency = (amount, options = {}) => {
  const {
    currency = CURRENCY.CODE,
    locale = CURRENCY.LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `Rp ${amount.toLocaleString()}`;
  }
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  const {
    locale = 'id-ID',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits
    }).format(number);
  } catch (error) {
    console.error('Number formatting error:', error);
    return number.toString();
  }
};

// Date formatting
export const formatDate = (date, options = {}) => {
  const {
    locale = 'id-ID',
    format = 'medium',
    timeZone = 'Asia/Jakarta'
  } = options;

  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  try {
    const formatterOptions = {
      timeZone,
      ...getDateFormatterOptions(format)
    };

    return new Intl.DateTimeFormat(locale, formatterOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString(locale);
  }
};

// Get date formatter options based on format type
const getDateFormatterOptions = (format) => {
  switch (format) {
    case 'short':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
    case 'medium':
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
    case 'long':
      return {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
    case 'time':
      return {
        hour: '2-digit',
        minute: '2-digit'
      };
    case 'datetime':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
    case 'relative':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
    default:
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
  }
};

// Relative time formatting (e.g., "2 hours ago")
export const formatRelativeTime = (date, options = {}) => {
  const { locale = 'id-ID' } = options;

  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return rtf.format(-minutes, 'minute');
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return rtf.format(-hours, 'hour');
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return rtf.format(-days, 'day');
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return rtf.format(-months, 'month');
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return rtf.format(-years, 'year');
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(date, { format: 'short' });
  }
};

// Text formatting
export const formatText = (text, options = {}) => {
  const {
    maxLength,
    truncate = false,
    capitalize = false,
    uppercase = false,
    lowercase = false
  } = options;

  if (!text) return '';

  let formattedText = text.toString();

  if (capitalize) {
    formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1).toLowerCase();
  }

  if (uppercase) {
    formattedText = formattedText.toUpperCase();
  }

  if (lowercase) {
    formattedText = formattedText.toLowerCase();
  }

  if (maxLength && formattedText.length > maxLength) {
    if (truncate) {
      formattedText = formattedText.substring(0, maxLength) + '...';
    }
  }

  return formattedText;
};

// Phone number formatting (Indonesian format)
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format Indonesian phone number
  if (cleaned.startsWith('62')) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  } else if (cleaned.startsWith('0')) {
    return `+62 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }

  return phone;
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Percentage formatting
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'id-ID',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value / 100);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${value.toFixed(maximumFractionDigits)}%`;
  }
};

// Credit card number masking
export const maskCreditCard = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(Math.max(0, cleaned.length - 4));
  
  return `${masked}${lastFour}`;
};

// Email masking
export const maskEmail = (email) => {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1)
    : localPart;
  
  return `${maskedLocal}@${domain}`;
};
