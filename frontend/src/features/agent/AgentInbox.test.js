import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AgentInbox from './AgentInbox';
import { useAgentInbox } from '@/hooks/useAgentInbox';

// Mock dependencies
jest.mock('@/hooks/useAgentInbox');

// Mock components
jest.mock('@/components/inbox/SessionListSkeleton', () => {
  return function MockSessionListSkeleton() {
    return <div data-testid="session-list-skeleton">Loading sessions...</div>;
  };
});

jest.mock('@/components/inbox/MessagesSkeleton', () => {
  return function MockMessagesSkeleton() {
    return <div data-testid="messages-skeleton">Loading messages...</div>;
  };
});

jest.mock('@/components/inbox/EmptySessions', () => {
  return function MockEmptySessions() {
    return <div data-testid="empty-sessions">No sessions found</div>;
  };
});

jest.mock('@/components/inbox/EmptyMessages', () => {
  return function MockEmptyMessages() {
    return <div data-testid="empty-messages">No messages yet</div>;
  };
});

jest.mock('@/components/inbox/ErrorState', () => {
  return function MockErrorState({ error, onRetry }) {
    return (
      <div data-testid="error-state">
        <p>Error: {error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  };
});

jest.mock('@/components/inbox/ConnectionStatus', () => {
  return function MockConnectionStatus({ isConnected }) {
    return (
      <div data-testid="connection-status">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    );
  };
});

// Mock data
const mockSessions = [
  {
    id: 'session-1',
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    last_message: 'Hello, I need help',
    last_message_at: '2024-01-15T10:30:00Z',
    unread_count: 2,
    status: 'active',
    priority: 'normal',
    tags: ['support'],
    agent_name: 'Agent Smith',
    started_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'session-2',
    customer_name: 'Jane Smith',
    customer_phone: '+0987654321',
    last_message: 'Thank you for your help',
    last_message_at: '2024-01-15T09:45:00Z',
    unread_count: 0,
    status: 'pending',
    priority: 'high',
    tags: ['billing'],
    agent_name: null,
    started_at: '2024-01-15T09:30:00Z'
  }
];

const mockMessages = [
  {
    id: 'msg-1',
    session_id: 'session-1',
    sender_type: 'customer',
    sender_name: 'John Doe',
    message_text: 'Hello, I need help with my order',
    message_type: 'text',
    created_at: '2024-01-15T10:00:00Z',
    is_read: false
  },
  {
    id: 'msg-2',
    session_id: 'session-1',
    sender_type: 'agent',
    sender_name: 'Agent Smith',
    message_text: 'Hello John! I\'ll help you with your order. Can you provide your order number?',
    message_type: 'text',
    created_at: '2024-01-15T10:05:00Z',
    is_read: true
  }
];

const mockAgents = [
  { id: 'agent-1', name: 'Agent Smith', status: 'online' },
  { id: 'agent-2', name: 'Agent Johnson', status: 'busy' }
];

// Default mock implementations
const defaultUseAgentInboxMock = {
  // Sessions
  sessions: mockSessions,
  selectedSession: mockSessions[0],
  filteredSessions: mockSessions,

  // Messages
  messages: mockMessages,

  // Agents
  agents: mockAgents,

  // Loading states
  loading: {
    sessions: false,
    messages: false,
    sending: false,
    transferring: false,
    wrappingUp: false,
    assigning: false
  },

  // Error states
  error: null,

  // Filters
  filters: {
    status: 'all',
    priority: 'all',
    agent: 'all',
    search: ''
  },

  // Functions
  selectSession: jest.fn(),
  sendMessage: jest.fn(),
  transferSession: jest.fn(),
  wrapUpSession: jest.fn(),
  assignSession: jest.fn(),
  markAsRead: jest.fn(),
  loadSessions: jest.fn(),
  loadSessionMessages: jest.fn(),
  setFilters: jest.fn(),
  debouncedSearch: jest.fn(),
  handleTypingStart: jest.fn(),
  handleTypingStop: jest.fn(),
  scrollToBottom: jest.fn(),
  refreshSessions: jest.fn()
};


describe('AgentInbox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAgentInbox.mockReturnValue(defaultUseAgentInboxMock);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render the main container', () => {
      renderComponent();
      expect(screen.getByTestId('realtime-provider')).toBeInTheDocument();
    });

    it('should render session list and messages area', () => {
      renderComponent();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render connection status', () => {
      renderComponent();
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
      expect(screen.getByText('Status: Connected')).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      renderComponent();
      expect(screen.getByPlaceholderText('Search conversations...')).toBeInTheDocument();
      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('All Priority')).toBeInTheDocument();
      expect(screen.getByText('All Agents')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderComponent();
      expect(screen.getByText('Transfer')).toBeInTheDocument();
      expect(screen.getByText('Wrap Up')).toBeInTheDocument();
      expect(screen.getByText('Assign')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show session list skeleton when loading sessions', () => {
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        loading: { ...defaultUseAgentInboxMock.loading, sessions: true }
      });

      renderComponent();
      expect(screen.getByTestId('session-list-skeleton')).toBeInTheDocument();
    });

    it('should show messages skeleton when loading messages', () => {
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        loading: { ...defaultUseAgentInboxMock.loading, messages: true }
      });

      renderComponent();
      expect(screen.getByTestId('messages-skeleton')).toBeInTheDocument();
    });

    it('should disable send button when sending message', () => {
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        loading: { ...defaultUseAgentInboxMock.loading, sending: true }
      });

      renderComponent();
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('should disable action buttons when performing actions', () => {
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        loading: {
          ...defaultUseAgentInboxMock.loading,
          transferring: true,
          wrappingUp: true,
          assigning: true
        }
      });

      renderComponent();
      expect(screen.getByText('Transfer')).toBeDisabled();
      expect(screen.getByText('Wrap Up')).toBeDisabled();
      expect(screen.getByText('Assign')).toBeDisabled();
    });
  });

  describe('Empty States', () => {
    it('should show empty sessions when no sessions available', () => {
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        sessions: [],
        filteredSessions: []
      });

      renderComponent();
      expect(screen.getByTestId('empty-sessions')).toBeInTheDocument();
    });

    it('should show empty messages when no messages available', () => {
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        messages: []
      });

      renderComponent();
      expect(screen.getByTestId('empty-messages')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error state when there is an error', () => {
      const errorMessage = 'Failed to load sessions';
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        error: errorMessage
      });

      renderComponent();
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should call loadSessions when retry button is clicked', async () => {
      const mockLoadSessions = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        error: 'Network error',
        loadSessions: mockLoadSessions
      });

      renderComponent();

      const retryButton = screen.getByText('Retry');
      await userEvent.click(retryButton);

      expect(mockLoadSessions).toHaveBeenCalled();
    });
  });

  describe('Session Selection', () => {
    it('should call selectSession when a session is clicked', async () => {
      const mockSelectSession = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        selectSession: mockSelectSession
      });

      renderComponent();

      const sessionItem = screen.getByText('John Doe');
      await userEvent.click(sessionItem);

      expect(mockSelectSession).toHaveBeenCalledWith(mockSessions[0]);
    });

    it('should highlight selected session', () => {
      renderComponent();
      const selectedSession = screen.getByText('John Doe').closest('[data-testid="session-item"]');
      expect(selectedSession).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('Search and Filtering', () => {
    it('should call debouncedSearch when typing in search input', async () => {
      const mockDebouncedSearch = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        debouncedSearch: mockDebouncedSearch
      });

      renderComponent();

      const searchInput = screen.getByPlaceholderText('Search conversations...');
      await userEvent.type(searchInput, 'John');

      expect(mockDebouncedSearch).toHaveBeenCalledWith('John');
    });

    it('should update filters when filter dropdowns change', async () => {
      const mockSetFilters = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        setFilters: mockSetFilters
      });

      renderComponent();

      const statusFilter = screen.getByText('All Status');
      await userEvent.click(statusFilter);

      // Assuming dropdown opens and shows options
      const activeOption = screen.getByText('Active');
      await userEvent.click(activeOption);

      expect(mockSetFilters).toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('should call sendMessage when send button is clicked', async () => {
      const mockSendMessage = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        sendMessage: mockSendMessage
      });

      renderComponent();

      const messageInput = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByRole('button', { name: /send/i });

      await userEvent.type(messageInput, 'Hello, how can I help you?');
      await userEvent.click(sendButton);

      expect(mockSendMessage).toHaveBeenCalledWith('Hello, how can I help you?');
    });

    it('should call sendMessage when Enter key is pressed', async () => {
      const mockSendMessage = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        sendMessage: mockSendMessage
      });

      renderComponent();

      const messageInput = screen.getByPlaceholderText('Type your message...');

      await userEvent.type(messageInput, 'Hello, how can I help you?');
      await userEvent.keyboard('{Enter}');

      expect(mockSendMessage).toHaveBeenCalledWith('Hello, how can I help you?');
    });

    it('should not send empty messages', async () => {
      const mockSendMessage = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        sendMessage: mockSendMessage
      });

      renderComponent();

      const sendButton = screen.getByRole('button', { name: /send/i });
      await userEvent.click(sendButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Session Actions', () => {
    it('should call transferSession when transfer button is clicked', async () => {
      const mockTransferSession = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        transferSession: mockTransferSession
      });

      renderComponent();

      const transferButton = screen.getByText('Transfer');
      await userEvent.click(transferButton);

      expect(mockTransferSession).toHaveBeenCalled();
    });

    it('should call wrapUpSession when wrap up button is clicked', async () => {
      const mockWrapUpSession = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        wrapUpSession: mockWrapUpSession
      });

      renderComponent();

      const wrapUpButton = screen.getByText('Wrap Up');
      await userEvent.click(wrapUpButton);

      expect(mockWrapUpSession).toHaveBeenCalled();
    });

    it('should call assignSession when assign button is clicked', async () => {
      const mockAssignSession = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        assignSession: mockAssignSession
      });

      renderComponent();

      const assignButton = screen.getByText('Assign');
      await userEvent.click(assignButton);

      expect(mockAssignSession).toHaveBeenCalled();
    });
  });

  describe('Real-time Messaging', () => {
    it('should register message handler on mount', () => {
      const mockRegisterMessageHandler = jest.fn();
      useRealtimeMessages.mockReturnValue({
        registerMessageHandler: mockRegisterMessageHandler
      });

      renderComponent();

      expect(mockRegisterMessageHandler).toHaveBeenCalled();
    });

    it('should register typing handler on mount', () => {
      const mockRegisterTypingHandler = jest.fn();
      useRealtimeMessages.mockReturnValue({
        registerTypingHandler: mockRegisterTypingHandler
      });

      renderComponent();

      expect(mockRegisterTypingHandler).toHaveBeenCalled();
    });

    it('should show disconnected status when not connected', () => {
      useRealtimeMessages.mockReturnValue({
        isConnected: false
      });

      renderComponent();

      expect(screen.getByText('Status: Disconnected')).toBeInTheDocument();
    });
  });

  describe('Typing Indicators', () => {
    it('should call handleTypingStart when typing in message input', async () => {
      const mockHandleTypingStart = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        handleTypingStart: mockHandleTypingStart
      });

      renderComponent();

      const messageInput = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(messageInput, 'H');

      expect(mockHandleTypingStart).toHaveBeenCalled();
    });

    it('should call handleTypingStop when stopping typing', async () => {
      const mockHandleTypingStop = jest.fn();
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        handleTypingStop: mockHandleTypingStop
      });

      renderComponent();

      const messageInput = screen.getByPlaceholderText('Type your message...');
      await userEvent.type(messageInput, 'Hello');

      // Simulate stopping typing (e.g., after timeout)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockHandleTypingStop).toHaveBeenCalled();
    });
  });

  describe('Message Display', () => {
    it('should display customer messages correctly', () => {
      renderComponent();

      expect(screen.getByText('Hello, I need help with my order')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display agent messages correctly', () => {
      renderComponent();

      expect(screen.getByText('Hello John! I\'ll help you with your order. Can you provide your order number?')).toBeInTheDocument();
      expect(screen.getByText('Agent Smith')).toBeInTheDocument();
    });

    it('should show unread count for sessions', () => {
      renderComponent();

      const unreadBadge = screen.getByText('2');
      expect(unreadBadge).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile and desktop', () => {
      renderComponent();

      const container = screen.getByTestId('realtime-provider').firstChild;
      expect(container).toHaveClass('h-screen', 'flex', 'bg-gray-50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderComponent();

      const searchInput = screen.getByPlaceholderText('Search conversations...');
      expect(searchInput).toBeInTheDocument();

      const messageInput = screen.getByPlaceholderText('Type your message...');
      expect(messageInput).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /transfer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wrap up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
    });
  });

  describe('Integration with Hooks', () => {
    it('should properly integrate with useAgentInbox hook', () => {
      renderComponent();

      expect(useAgentInbox).toHaveBeenCalled();
    });

    it('should properly integrate with useAgentInbox hook', () => {
      renderComponent();

      expect(useAgentInbox).toHaveBeenCalled();
    });

    it('should handle hook state changes correctly', () => {
      const { rerender } = renderComponent();

      // Change hook return value
      useAgentInbox.mockReturnValue({
        ...defaultUseAgentInboxMock,
        sessions: [],
        error: 'New error'
      });

      rerender(
        <BrowserRouter>
          <AgentInbox />
        </BrowserRouter>
      );

      expect(screen.getByTestId('empty-sessions')).toBeInTheDocument();
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });
});

