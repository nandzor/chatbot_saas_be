import React from 'react';
import { Loader2, MessageSquare, Users, BookOpen, History } from 'lucide-react';

// Loading skeleton for session list
export const SessionListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="p-2.5 border-b border-gray-100 animate-pulse">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1">
            <div className="w-12 h-4 bg-gray-300 rounded"></div>
            <div className="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="w-8 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-32 mb-1.5"></div>
        <div className="flex items-center justify-between">
          <div className="w-12 h-3 bg-gray-200 rounded"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Loading skeleton for messages
export const MessagesSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${
          index % 2 === 0
            ? 'bg-white border border-gray-200'
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
        }`}>
          <div className={`h-4 bg-gray-300 rounded w-32 mb-2 ${
            index % 2 === 0 ? '' : 'bg-blue-200'
          }`}></div>
          <div className={`h-3 bg-gray-200 rounded w-16 ${
            index % 2 === 0 ? '' : 'bg-blue-100'
          }`}></div>
        </div>
      </div>
    ))}
  </div>
);

// Loading skeleton for customer info
export const CustomerInfoSkeleton = () => (
  <div className="space-y-2.5">
    <div className="p-2.5 border border-gray-200 rounded-lg animate-pulse">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Loading skeleton for knowledge base
export const KnowledgeSkeleton = () => (
  <div className="space-y-1.5">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-2.5 border border-gray-200 rounded-lg animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="h-3 bg-gray-300 rounded w-32 mb-1"></div>
            <div className="flex items-center space-x-1">
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
              <div className="w-8 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Loading skeleton for history
export const HistorySkeleton = () => (
  <div className="space-y-1.5">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="p-2.5 border border-gray-200 rounded-lg animate-pulse">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="h-3 bg-gray-300 rounded w-40 mb-1"></div>
        <div className="flex items-center justify-between">
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-12 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Generic loading component
export const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    </div>
  );
};

// Empty state components
export const EmptySessions = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    <div className="text-center">
      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
      <p className="text-gray-600">No chat sessions match your current filters</p>
    </div>
  </div>
);

export const EmptyMessages = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    <div className="text-center">
      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
      <p className="text-gray-600">Start the conversation by sending a message</p>
    </div>
  </div>
);

export const EmptyKnowledge = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    <div className="text-center">
      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge articles</h3>
      <p className="text-gray-600">No articles found matching your search</p>
    </div>
  </div>
);

export const EmptyHistory = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    <div className="text-center">
      <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No history found</h3>
      <p className="text-gray-600">No previous interactions for this customer</p>
    </div>
  </div>
);

// Error state components
export const ErrorState = ({ error, onRetry }) => (
  <div className="flex items-center justify-center p-8 text-red-600">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Connection status indicator
export const ConnectionStatus = ({ isConnected, isConnecting }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-2 h-2 rounded-full ${
      isConnecting ? 'bg-yellow-500 animate-pulse' :
      isConnected ? 'bg-green-500' : 'bg-red-500'
    }`}></div>
    <span className="text-xs text-gray-600">
      {isConnecting ? 'Connecting...' :
       isConnected ? 'Connected' : 'Disconnected'}
    </span>
  </div>
);

export default {
  SessionListSkeleton,
  MessagesSkeleton,
  CustomerInfoSkeleton,
  KnowledgeSkeleton,
  HistorySkeleton,
  LoadingSpinner,
  EmptySessions,
  EmptyMessages,
  EmptyKnowledge,
  EmptyHistory,
  ErrorState,
  ConnectionStatus
};
