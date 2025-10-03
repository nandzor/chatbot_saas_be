/**
 * Laravel Echo Helper Functions
 * Utility functions for working with Laravel Echo
 */

import { EventNames } from '@/config/echo';

/**
 * Format message data for display
 */
export const formatMessageData = (data) => {
  return {
    id: data.id || data.message_id,
    content: data.content || data.message || data.body,
    sender_type: data.sender_type || data.type,
    created_at: data.created_at || data.timestamp,
    is_read: data.is_read || false,
    delivered_at: data.delivered_at,
    read_at: data.read_at,
    session_id: data.session_id,
    user_id: data.user_id,
    metadata: data.metadata || {}
  };
};

/**
 * Format typing indicator data
 */
export const formatTypingData = (data) => {
  return {
    session_id: data.session_id,
    user_id: data.user_id,
    user_name: data.user_name || data.name,
    is_typing: data.is_typing,
    timestamp: data.timestamp || new Date().toISOString()
  };
};

/**
 * Format session update data
 */
export const formatSessionData = (data) => {
  return {
    id: data.session_id || data.id,
    status: data.status,
    agent_id: data.agent_id,
    priority: data.priority,
    category: data.category,
    last_activity_at: data.last_activity_at || new Date().toISOString(),
    ended_at: data.ended_at,
    metadata: data.metadata || {}
  };
};

/**
 * Check if event is a message event
 */
export const isMessageEvent = (eventName) => {
  return [
    EventNames.MESSAGE_SENT,
    EventNames.MESSAGE_PROCESSED,
    EventNames.MESSAGE_READ
  ].includes(eventName);
};

/**
 * Check if event is a typing event
 */
export const isTypingEvent = (eventName) => {
  return [
    EventNames.TYPING_START,
    EventNames.TYPING_STOP
  ].includes(eventName);
};

/**
 * Check if event is a session event
 */
export const isSessionEvent = (eventName) => {
  return [
    EventNames.SESSION_UPDATED,
    EventNames.SESSION_ASSIGNED,
    EventNames.SESSION_TRANSFERRED,
    EventNames.SESSION_ENDED
  ].includes(eventName);
};

/**
 * Get event display name
 */
export const getEventDisplayName = (eventName) => {
  const eventNames = {
    [EventNames.MESSAGE_SENT]: 'Message Sent',
    [EventNames.MESSAGE_PROCESSED]: 'Message Processed',
    [EventNames.MESSAGE_READ]: 'Message Read',
    [EventNames.SESSION_UPDATED]: 'Session Updated',
    [EventNames.SESSION_ASSIGNED]: 'Session Assigned',
    [EventNames.SESSION_TRANSFERRED]: 'Session Transferred',
    [EventNames.SESSION_ENDED]: 'Session Ended',
    [EventNames.TYPING_START]: 'Typing Start',
    [EventNames.TYPING_STOP]: 'Typing Stop',
    [EventNames.USER_ONLINE]: 'User Online',
    [EventNames.USER_OFFLINE]: 'User Offline'
  };

  return eventNames[eventName] || eventName;
};

/**
 * Create message event payload
 */
export const createMessageEventPayload = (sessionId, message, type = 'text') => {
  return {
    session_id: sessionId,
    content: message,
    message_type: type,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create typing event payload
 */
export const createTypingEventPayload = (sessionId, userId, isTyping) => {
  return {
    session_id: sessionId,
    user_id: userId,
    is_typing: isTyping,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create session event payload
 */
export const createSessionEventPayload = (sessionId, updates) => {
  return {
    session_id: sessionId,
    ...updates,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validate event data
 */
export const validateEventData = (data, requiredFields = []) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return requiredFields.every(field => Object.prototype.hasOwnProperty.call(data, field));
};

/**
 * Debounce function for typing indicators
 */
export const debounceTyping = (func, delay = 1000) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function for high-frequency events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate unique event ID
 */
export const generateEventId = () => {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse channel name
 */
export const parseChannelName = (channelName) => {
  const parts = channelName.split('.');
  return {
    type: parts[0],
    identifier: parts[1],
    full: channelName
  };
};

/**
 * Check if channel is private
 */
export const isPrivateChannel = (channelName) => {
  return channelName.startsWith('private-');
};

/**
 * Check if channel is presence
 */
export const isPresenceChannel = (channelName) => {
  return channelName.startsWith('presence-');
};

export default {
  formatMessageData,
  formatTypingData,
  formatSessionData,
  isMessageEvent,
  isTypingEvent,
  isSessionEvent,
  getEventDisplayName,
  createMessageEventPayload,
  createTypingEventPayload,
  createSessionEventPayload,
  validateEventData,
  debounceTyping,
  throttle,
  generateEventId,
  parseChannelName,
  isPrivateChannel,
  isPresenceChannel
};
