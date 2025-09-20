import { useState, useEffect, useCallback, useRef } from 'react';
import { wahaApi } from '@/services/wahaService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

// Constants
const MESSAGE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker'
};

const ERROR_MESSAGES = {
  LOAD_MESSAGES: 'Gagal memuat pesan',
  SEND_MESSAGE: 'Gagal mengirim pesan',
  DELETE_MESSAGE: 'Gagal menghapus pesan',
  MARK_READ: 'Gagal menandai pesan sebagai dibaca'
};

export const useWhatsAppChat = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId, limit = 50, before = null) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await wahaApi.getMessages(sessionId, {
        limit,
        before
      });

      if (response.success) {
        const messagesData = response.data?.messages || [];
        
        // Format messages for display
        const formattedMessages = messagesData.map(message => ({
          id: message.id || message.messageId,
          content: message.body || message.text || '',
          timestamp: message.timestamp || message.createdAt,
          direction: message.fromMe ? 'outgoing' : 'incoming',
          status: message.status || MESSAGE_STATUS.SENT,
          type: message.type || MESSAGE_TYPES.TEXT,
          from: message.from,
          to: message.to,
          mediaUrl: message.mediaUrl,
          caption: message.caption,
          fileName: message.fileName,
          fileSize: message.fileSize,
          mimeType: message.mimeType,
          location: message.location,
          contact: message.contact,
          quotedMessage: message.quotedMessage,
          reactions: message.reactions || [],
          isForwarded: message.isForwarded || false,
          isStarred: message.isStarred || false
        }));

        setMessages(prev => {
          // Merge with existing messages and remove duplicates
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = formattedMessages.filter(m => !existingIds.has(m.id));
          return [...newMessages, ...prev].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
        });

        // Update unread count
        const unreadMessages = formattedMessages.filter(m => 
          m.direction === 'incoming' && m.status !== MESSAGE_STATUS.READ
        );
        setUnreadCount(prev => prev + unreadMessages.length);

        // Update last message ID for pagination
        if (formattedMessages.length > 0) {
          setLastMessageId(formattedMessages[0].id);
        }

        return formattedMessages;
      } else {
        throw new Error(response.error || 'Failed to load messages');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message || ERROR_MESSAGES.LOAD_MESSAGES);
      
      if (errorMessage.type === 'organization_error') {
        toast.error('Anda harus menjadi anggota organization untuk mengakses pesan');
      } else if (errorMessage.type === 'auth_error') {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        toast.error(`${ERROR_MESSAGES.LOAD_MESSAGES}: ${errorMessage.message}`);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (sessionId, content, options = {}) => {
    if (!sessionId || !content) return;

    try {
      setSending(true);
      setError(null);

      // Create temporary message for optimistic UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        direction: 'outgoing',
        status: MESSAGE_STATUS.PENDING,
        type: options.type || MESSAGE_TYPES.TEXT,
        from: options.from,
        to: options.to
      };

      // Add temporary message to UI
      setMessages(prev => [...prev, tempMessage]);

      const response = await wahaApi.sendMessage(sessionId, {
        to: options.to,
        body: content,
        type: options.type || MESSAGE_TYPES.TEXT,
        mediaUrl: options.mediaUrl,
        caption: options.caption,
        location: options.location,
        contact: options.contact,
        quotedMessage: options.quotedMessage
      });

      if (response.success) {
        // Replace temporary message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...msg,
                id: response.data.id || response.data.messageId,
                status: MESSAGE_STATUS.SENT,
                timestamp: response.data.timestamp || new Date().toISOString()
              }
            : msg
        ));

        toast.success('Pesan berhasil dikirim');
        return response.data;
      } else {
        // Remove temporary message on failure
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message || ERROR_MESSAGES.SEND_MESSAGE);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      
      toast.error(`${ERROR_MESSAGES.SEND_MESSAGE}: ${errorMessage.message}`);
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (sessionId, messageId) => {
    if (!sessionId || !messageId) return;

    try {
      const response = await wahaApi.deleteMessage(sessionId, messageId);

      if (response.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        toast.success('Pesan berhasil dihapus');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to delete message');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`${ERROR_MESSAGES.DELETE_MESSAGE}: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (sessionId, messageIds) => {
    if (!sessionId || !messageIds?.length) return;

    try {
      const response = await wahaApi.markAsRead(sessionId, messageIds);

      if (response.success) {
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) 
            ? { ...msg, status: MESSAGE_STATUS.READ }
            : msg
        ));
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - messageIds.length));
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to mark messages as read');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`${ERROR_MESSAGES.MARK_READ}: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Start polling for new messages
  const startPolling = useCallback((sessionId, interval = 5000) => {
    if (!sessionId || pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        await loadMessages(sessionId, 10, lastMessageId);
      } catch (err) {
        // Handle polling error silently
      }
    }, interval);
  }, [loadMessages, lastMessageId]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Load messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
      startPolling(sessionId);
    } else {
      setMessages([]);
      setUnreadCount(0);
      setLastMessageId(null);
    }

    return () => {
      stopPolling();
    };
  }, [sessionId, loadMessages, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // State
    messages,
    loading,
    sending,
    error,
    isTyping,
    unreadCount,
    
    // Actions
    loadMessages,
    sendMessage,
    deleteMessage,
    markAsRead,
    startPolling,
    stopPolling,
    
    // Utilities
    MESSAGE_STATUS,
    MESSAGE_TYPES
  };
};
