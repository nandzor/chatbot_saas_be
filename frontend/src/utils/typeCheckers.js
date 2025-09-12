/**
 * Type Checking Utilities
 * Utility functions untuk type checking dan validation
 */

/**
 * Check if value is a valid string
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid string
 */
export const isString = (value) => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Check if value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid number
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Check if value is a valid boolean
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid boolean
 */
export const isBoolean = (value) => {
  return typeof value === 'boolean';
};

/**
 * Check if value is a valid array
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid array
 */
export const isArray = (value) => {
  return Array.isArray(value);
};

/**
 * Check if value is a valid object
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid object
 */
export const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Check if value is a valid function
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid function
 */
export const isFunction = (value) => {
  return typeof value === 'function';
};

/**
 * Check if value is null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} - Is null or undefined
 */
export const isNullOrUndefined = (value) => {
  return value === null || value === undefined;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - Is empty
 */
export const isEmpty = (value) => {
  if (isNullOrUndefined(value)) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if value is a valid email
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid email
 */
export const isEmail = (value) => {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Check if value is a valid URL
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid URL
 */
export const isUrl = (value) => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is a valid phone number
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid phone number
 */
export const isPhone = (value) => {
  if (!isString(value)) return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(value.replace(/\s/g, ''));
};

/**
 * Check if value is a valid date
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid date
 */
export const isDate = (value) => {
  if (value instanceof Date) return !isNaN(value.getTime());
  if (isString(value)) {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
};

/**
 * Check if value is a valid ID (string or positive number)
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid ID
 */
export const isValidId = (value) => {
  if (isString(value)) return value.length > 0;
  if (isNumber(value)) return value > 0;
  return false;
};

/**
 * Check if value is a valid status
 * @param {*} value - Value to check
 * @param {string[]} validStatuses - Array of valid statuses
 * @returns {boolean} - Is valid status
 */
export const isValidStatus = (value, validStatuses) => {
  return isString(value) && validStatuses.includes(value);
};

/**
 * Check if value is a valid color (hex, rgb, rgba, hsl, hsla, named)
 * @param {*} value - Value to check
 * @returns {boolean} - Is valid color
 */
export const isColor = (value) => {
  if (!isString(value)) return false;

  // CSS named colors
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'transparent'
  ];

  // Check for named colors
  if (namedColors.includes(value.toLowerCase())) return true;

  // Check for hex colors
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexRegex.test(value)) return true;

  // Check for rgb/rgba colors
  const rgbRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/;
  if (rgbRegex.test(value)) return true;

  // Check for hsl/hsla colors
  const hslRegex = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/;
  if (hslRegex.test(value)) return true;

  return false;
};

/**
 * Check if object has required properties
 * @param {Object} obj - Object to check
 * @param {string[]} requiredProps - Array of required property names
 * @returns {boolean} - Has all required properties
 */
export const hasRequiredProps = (obj, requiredProps) => {
  if (!isObject(obj) || !isArray(requiredProps)) return false;
  return requiredProps.every(prop => obj.hasOwnProperty(prop) && !isNullOrUndefined(obj[prop]));
};

/**
 * Type checker for User object
 * @param {*} user - User object to check
 * @returns {boolean} - Is valid user
 */
export const isValidUser = (user) => {
  if (!isObject(user)) return false;
  return hasRequiredProps(user, ['id', 'name', 'email']) &&
         isValidId(user.id) &&
         isString(user.name) &&
         isEmail(user.email);
};

/**
 * Type checker for Organization object
 * @param {*} org - Organization object to check
 * @returns {boolean} - Is valid organization
 */
export const isValidOrganization = (org) => {
  if (!isObject(org)) return false;
  return hasRequiredProps(org, ['id', 'name']) &&
         isValidId(org.id) &&
         isString(org.name);
};

/**
 * Type checker for Subscription object
 * @param {*} subscription - Subscription object to check
 * @returns {boolean} - Is valid subscription
 */
export const isValidSubscription = (subscription) => {
  if (!isObject(subscription)) return false;
  const validStatuses = ['active', 'inactive', 'cancelled', 'expired', 'trial'];
  return hasRequiredProps(subscription, ['id', 'plan_id', 'organization_id', 'status']) &&
         isValidId(subscription.id) &&
         isValidId(subscription.plan_id) &&
         isValidId(subscription.organization_id) &&
         isValidStatus(subscription.status, validStatuses);
};

/**
 * Type checker for Chatbot object
 * @param {*} chatbot - Chatbot object to check
 * @returns {boolean} - Is valid chatbot
 */
export const isValidChatbot = (chatbot) => {
  if (!isObject(chatbot)) return false;
  return hasRequiredProps(chatbot, ['id', 'name', 'organization_id']) &&
         isValidId(chatbot.id) &&
         isString(chatbot.name) &&
         isValidId(chatbot.organization_id);
};

/**
 * Type checker for Conversation object
 * @param {*} conversation - Conversation object to check
 * @returns {boolean} - Is valid conversation
 */
export const isValidConversation = (conversation) => {
  if (!isObject(conversation)) return false;
  return hasRequiredProps(conversation, ['id', 'chatbot_id']) &&
         isValidId(conversation.id) &&
         isValidId(conversation.chatbot_id);
};

/**
 * Type checker for Payment object
 * @param {*} payment - Payment object to check
 * @returns {boolean} - Is valid payment
 */
export const isValidPayment = (payment) => {
  if (!isObject(payment)) return false;
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
  return hasRequiredProps(payment, ['id', 'subscription_id', 'amount', 'currency', 'status']) &&
         isValidId(payment.id) &&
         isValidId(payment.subscription_id) &&
         isNumber(payment.amount) &&
         payment.amount >= 0 &&
         isString(payment.currency) &&
         isValidStatus(payment.status, validStatuses);
};

/**
 * Type checker for API Response
 * @param {*} response - API response to check
 * @returns {boolean} - Is valid API response
 */
export const isValidApiResponse = (response) => {
  if (!isObject(response)) return false;
  return hasRequiredProps(response, ['success']) &&
         isBoolean(response.success);
};

/**
 * Type checker for Paginated Response
 * @param {*} response - Paginated response to check
 * @returns {boolean} - Is valid paginated response
 */
export const isValidPaginatedResponse = (response) => {
  if (!isValidApiResponse(response)) return false;
  return hasRequiredProps(response, ['data', 'meta']) &&
         isArray(response.data) &&
         isObject(response.meta) &&
         hasRequiredProps(response.meta, ['current_page', 'last_page', 'per_page', 'total']);
};

/**
 * Safe type conversion with fallback
 * @param {*} value - Value to convert
 * @param {'string'|'number'|'boolean'|'array'|'object'} type - Target type
 * @param {*} fallback - Fallback value
 * @returns {*} - Converted value or fallback
 */
export const safeConvert = (value, type, fallback = null) => {
  try {
    switch (type) {
      case 'string':
        return isString(value) ? value : String(value);
      case 'number':
        const num = Number(value);
        return isNumber(num) ? num : fallback;
      case 'boolean':
        if (isBoolean(value)) return value;
        if (isString(value)) return ['true', '1', 'yes'].includes(value.toLowerCase());
        return Boolean(value);
      case 'array':
        return isArray(value) ? value : fallback;
      case 'object':
        return isObject(value) ? value : fallback;
      default:
        return value;
    }
  } catch {
    return fallback;
  }
};

/**
 * Deep type checking for nested objects
 * @param {*} obj - Object to check
 * @param {Object} schema - Schema definition
 * @returns {boolean} - Matches schema
 */
export const matchesSchema = (obj, schema) => {
  if (!isObject(obj) || !isObject(schema)) return false;

  for (const [key, validator] of Object.entries(schema)) {
    if (isFunction(validator)) {
      if (!validator(obj[key])) return false;
    } else if (isObject(validator)) {
      if (!matchesSchema(obj[key], validator)) return false;
    } else {
      if (obj[key] !== validator) return false;
    }
  }

  return true;
};

export default {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isNullOrUndefined,
  isEmpty,
  isEmail,
  isUrl,
  isPhone,
  isDate,
  isValidId,
  isValidStatus,
  isColor,
  hasRequiredProps,
  isValidUser,
  isValidOrganization,
  isValidSubscription,
  isValidChatbot,
  isValidConversation,
  isValidPayment,
  isValidApiResponse,
  isValidPaginatedResponse,
  safeConvert,
  matchesSchema,
};
