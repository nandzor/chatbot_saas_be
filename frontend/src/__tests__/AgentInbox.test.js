import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AgentInbox from '../features/agent/AgentInbox';
import { useAgentInbox } from '../hooks/useAgentInbox';

// Mock the hooks
jest.mock('../hooks/useAgentInbox');
jest.mock('../hooks/useApi');

const mockUseAgentInbox = {
  sessions: [
    {
      id: 'session-1',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Corp'
      },
      status: 'active',
      priority: 'high',
      category: 'technical',
      last_message: 'Hello, I need help',
      last_message_at: '2024-01-25T10:00:00Z',
      unread_count: 2
    }
  ],
  selectedSession: null,
  messages: [],
  loading: false,
  error: null,
  filters: { status: 'all', search: '', priority: 'all' },
  pagination: { page: 1, per_page: 20, total: 1, last_page: 1 },
  isConnected: true,
  loadSessions: jest.fn(),
  loadActiveSessions: jest.fn(),
  loadPendingSessions: jest.fn(),
  selectSession: jest.fn(),
  sendMessage: jest.fn(),
  transferSession: jest.fn(),
  endSession: jest.fn(),
  assignSession: jest.fn(),
  updateFilters: jest.fn(),
  refreshSessions: jest.fn(),
  handleTyping: jest.fn()
};

const mockUseApi = {
  data: {
    data: [
      { id: 'agent-1', name: 'Agent Smith', email: 'agent@example.com' }
    ]
  },
  loading: false
};

describe('AgentInbox', () => {
  beforeEach(() => {
    useAgentInbox.mockReturnValue(mockUseAgentInbox);
    require('../hooks/useApi').useApi.mockReturnValue(mockUseApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders agent inbox interface', () => {
    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    expect(screen.getByText('Agent Inbox')).toBeInTheDocument();
    expect(screen.getByText('My Queue')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('displays sessions list', () => {
    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
    expect(screen.getByText('Hello, I need help')).toBeInTheDocument();
  });

  it('handles session selection', async () => {
    const mockSelectSession = jest.fn();
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      selectSession: mockSelectSession
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    const sessionItem = screen.getByText('John Doe').closest('div');
    fireEvent.click(sessionItem);

    await waitFor(() => {
      expect(mockSelectSession).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'session-1',
          customer: expect.objectContaining({
            name: 'John Doe'
          })
        })
      );
    });
  });

  it('handles tab switching', async () => {
    const mockLoadActiveSessions = jest.fn();
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      loadActiveSessions: mockLoadActiveSessions
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    const activeTab = screen.getByText('Active');
    fireEvent.click(activeTab);

    await waitFor(() => {
      expect(mockLoadActiveSessions).toHaveBeenCalled();
    });
  });

  it('handles search filtering', async () => {
    const mockUpdateFilters = jest.fn();
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      updateFilters: mockUpdateFilters
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Cari customer...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: 'John' });
    });
  });

  it('displays loading state', () => {
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      loading: true
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      error: 'Failed to load sessions'
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    expect(screen.getByText('Failed to load sessions')).toBeInTheDocument();
  });

  it('shows empty state when no sessions', () => {
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      sessions: []
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    expect(screen.getByText('No sessions found')).toBeInTheDocument();
  });

  it('handles message sending', async () => {
    const mockSendMessage = jest.fn();
    const mockSession = {
      id: 'session-1',
      customer: { name: 'John Doe' }
    };

    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      selectedSession: mockSession,
      sendMessage: mockSendMessage
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    const messageInput = screen.getByPlaceholderText('Ketik pesan...');
    const sendButton = screen.getByTitle('Send message');

    fireEvent.change(messageInput, { target: { value: 'Hello customer' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('session-1', 'Hello customer', 'text');
    });
  });

  it('handles session assignment', async () => {
    const mockAssignSession = jest.fn();
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      assignSession: mockAssignSession
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    const assignButton = screen.getByTitle('Assign session');
    if (assignButton) {
      fireEvent.click(assignButton);

      await waitFor(() => {
        expect(mockAssignSession).toHaveBeenCalledWith('session-1');
      });
    }
  });

  it('handles refresh', async () => {
    const mockRefreshSessions = jest.fn();
    useAgentInbox.mockReturnValue({
      ...mockUseAgentInbox,
      refreshSessions: mockRefreshSessions
    });

    render(
      <BrowserRouter>
        <AgentInbox />
      </BrowserRouter>
    );

    const refreshButton = screen.getByTitle('Refresh sessions');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefreshSessions).toHaveBeenCalled();
    });
  });
});
