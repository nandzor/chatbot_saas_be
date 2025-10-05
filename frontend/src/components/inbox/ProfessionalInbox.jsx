import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import ProfessionalConversationList from './ProfessionalConversationList';
import ProfessionalChatWindow from './ProfessionalChatWindow';
import { cn } from '@/lib/utils';

const ProfessionalInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    unassigned: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    loadConversations();
    loadStats();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockConversations = [
        {
          id: '1',
          customer: {
            id: '1',
            name: 'John Doe',
            phone: '+1234567890',
            email: 'john@example.com',
            avatar_url: null
          },
          agent: {
            id: '1',
            name: 'Agent Smith',
            email: 'agent@example.com',
            avatar_url: null,
            status: 'active'
          },
          session_info: {
            is_active: true,
            is_resolved: false,
            is_bot_session: false,
            started_at: '2024-01-15T10:30:00Z',
            last_activity_at: '2024-01-15T14:30:00Z'
          },
          classification: {
            priority: 'high',
            category: 'support',
            tags: ['urgent', 'billing']
          },
          last_message: {
            id: '1',
            content: {
              text: 'I need help with my billing issue'
            },
            created_at: '2024-01-15T14:30:00Z'
          },
          unread_count: 2
        },
        {
          id: '2',
          customer: {
            id: '2',
            name: 'Jane Smith',
            phone: '+0987654321',
            email: 'jane@example.com',
            avatar_url: null
          },
          agent: null,
          session_info: {
            is_active: true,
            is_resolved: false,
            is_bot_session: true,
            started_at: '2024-01-15T11:00:00Z',
            last_activity_at: '2024-01-15T11:15:00Z'
          },
          classification: {
            priority: 'normal',
            category: 'general',
            tags: ['question']
          },
          last_message: {
            id: '2',
            content: {
              text: 'How can I reset my password?'
            },
            created_at: '2024-01-15T11:15:00Z'
          },
          unread_count: 0
        },
        {
          id: '3',
          customer: {
            id: '3',
            name: 'Bob Johnson',
            phone: '+1122334455',
            email: 'bob@example.com',
            avatar_url: null
          },
          agent: {
            id: '2',
            name: 'Agent Brown',
            email: 'brown@example.com',
            avatar_url: null,
            status: 'active'
          },
          session_info: {
            is_active: false,
            is_resolved: true,
            is_bot_session: false,
            started_at: '2024-01-14T09:00:00Z',
            last_activity_at: '2024-01-14T16:00:00Z'
          },
          classification: {
            priority: 'low',
            category: 'support',
            tags: ['resolved']
          },
          last_message: {
            id: '3',
            content: {
              text: 'Thank you for your help!'
            },
            created_at: '2024-01-14T16:00:00Z'
          },
          unread_count: 0
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        total: 3,
        active: 2,
        resolved: 1,
        unassigned: 1
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  const handleRefresh = () => {
    loadConversations();
    loadStats();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Resolved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Unassigned</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.unassigned}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1">
          <ProfessionalConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
            loading={loading}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ProfessionalChatWindow
            sessionId={selectedConversation.id}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInbox;
