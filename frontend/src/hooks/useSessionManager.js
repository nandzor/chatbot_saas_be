import { useState, useMemo, useCallback } from 'react';
import { 
  chatSessionsData, 
  customersData, 
  channelConfigsData, 
  agentsData, 
  sessionsMessagesData 
} from '../data/sampleData';

export const useSessionManager = () => {
  // State management
  const [selectedSession, setSelectedSession] = useState(null);
  const [filters, setFilters] = useState({
    channel: 'all',
    agent: 'all',
    status: 'all',
    tags: '',
    search: ''
  });

  // Enrich sessions with related data
  const enrichedSessions = useMemo(() => {
    return chatSessionsData.map(session => {
      const customer = customersData.find(c => c.id === session.customer_id);
      const channelConfig = channelConfigsData.find(cc => cc.id === session.channel_config_id);
      const agent = agentsData.find(a => a.id === session.agent_id);
      const messages = sessionsMessagesData.filter(m => m.session_id === session.id);
      const lastMessage = messages[messages.length - 1];
      
      return {
        ...session,
        customer,
        channelConfig,
        agent,
        messages,
        lastMessage,
        unreadCount: messages.filter(m => 
          m.sender_type === 'customer' && 
          m.created_at > (session.last_read_at || '2024-03-20T14:00:00Z')
        ).length
      };
    });
  }, []);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return enrichedSessions.filter(session => {
      // Filter berdasarkan channel
      if (filters.channel !== 'all' && session.channelConfig?.channel_type !== filters.channel) {
        return false;
      }
      
      // Filter berdasarkan agent
      if (filters.agent !== 'all') {
        if (filters.agent === 'unassigned' && session.agent_id !== null) return false;
        if (filters.agent !== 'unassigned' && session.agent_id !== parseInt(filters.agent)) return false;
      }
      
      // Filter berdasarkan status
      if (filters.status !== 'all' && session.status !== filters.status) {
        return false;
      }
      
      // Filter berdasarkan tags
      if (filters.tags && !session.tags.some(tag => 
        tag.toLowerCase().includes(filters.tags.toLowerCase())
      )) {
        return false;
      }
      
      // Filter berdasarkan pencarian
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const customerName = session.customer?.name?.toLowerCase() || '';
        const lastMessageContent = session.lastMessage?.content?.toLowerCase() || '';
        
        if (!customerName.includes(searchLower) && !lastMessageContent.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }, [enrichedSessions, filters]);

  // Update filters
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      channel: 'all',
      agent: 'all',
      status: 'all',
      tags: '',
      search: ''
    });
  }, []);

  // Session actions
  const assignAgent = useCallback((sessionId, agentId) => {
    console.log('Assigning agent:', agentId, 'to session:', sessionId);
    // Implementasi API call akan ditambahkan di sini
  }, []);

  const updateSessionStatus = useCallback((sessionId, status) => {
    console.log('Updating session status:', status, 'for session:', sessionId);
    // Implementasi API call akan ditambahkan di sini
  }, []);

  const addTag = useCallback((sessionId, tag) => {
    console.log('Adding tag:', tag, 'to session:', sessionId);
    // Implementasi API call akan ditambahkan di sini
  }, []);

  const removeTag = useCallback((sessionId, tag) => {
    console.log('Removing tag:', tag, 'from session:', sessionId);
    // Implementasi API call akan ditambahkan di sini
  }, []);

  const sendMessage = useCallback((sessionId, content, type = 'text', mediaUrl = null) => {
    console.log('Sending message to session:', sessionId, 'content:', content);
    // Implementasi API call akan ditambahkan di sini
  }, []);

  return {
    // Data
    sessions: filteredSessions,
    selectedSession,
    enrichedSessions,
    filters,
    
    // Actions
    setSelectedSession,
    updateFilter,
    clearFilters,
    assignAgent,
    updateSessionStatus,
    addTag,
    removeTag,
    sendMessage,
    
    // Computed values
    activeSessions: filteredSessions.filter(s => s.status === 'active'),
    totalUnread: filteredSessions.reduce((sum, s) => sum + s.unreadCount, 0)
  };
};
