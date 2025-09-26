import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, Filter, MessageSquare, User, Bot, Calendar } from 'lucide-react';
import { useConversationContext } from '../../contexts/ConversationContext';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const ConversationSearch = ({ sessionId, onClose, onMessageSelect }) => {
  const { searchMessages } = useConversationContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sender_type: '',
    message_type: '',
    date_from: '',
    date_to: '',
    per_page: 20
  });

  /**
   * Perform search
   */
  const performSearch = useCallback(async () => {
    if (!query.trim() || !sessionId) return;

    setLoading(true);
    try {
      const searchResults = await searchMessages(sessionId, query, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, query, filters, searchMessages]);

  /**
   * Handle search input change
   */
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFilters({
      sender_type: '',
      message_type: '',
      date_from: '',
      date_to: '',
      per_page: 20
    });
  };

  /**
   * Handle message click
   */
  const handleMessageClick = (message) => {
    if (onMessageSelect) {
      onMessageSelect(message);
    }
  };

  /**
   * Get sender icon
   */
  const getSenderIcon = (senderType) => {
    switch (senderType) {
      case 'customer':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'agent':
        return <User className="w-4 h-4 text-green-500" />;
      case 'bot':
        return <Bot className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * Format message preview
   */
  const formatMessagePreview = (text, maxLength = 100) => {
    if (!text) return 'Pesan kosong';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Highlight search terms in text
   */
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Auto-search when query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Cari Pesan dalam Percakapan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Ketik untuk mencari pesan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Toggle */}
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter Pencarian
            </button>

            {results.length > 0 && (
              <span className="text-sm text-gray-500">
                {results.length} hasil ditemukan
              </span>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pengirim
                </label>
                <select
                  value={filters.sender_type}
                  onChange={(e) => handleFilterChange('sender_type', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Semua</option>
                  <option value="customer">Customer</option>
                  <option value="agent">Agent</option>
                  <option value="bot">Bot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Pesan
                </label>
                <select
                  value={filters.message_type}
                  onChange={(e) => handleFilterChange('message_type', e.target.value)}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Semua</option>
                  <option value="text">Text</option>
                  <option value="image">Gambar</option>
                  <option value="document">Dokumen</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Hasil
                </label>
                <select
                  value={filters.per_page}
                  onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                  className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Mencari...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada pesan yang ditemukan</p>
              <p className="text-sm text-gray-400 mt-1">
                Coba gunakan kata kunci yang berbeda
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getSenderIcon(message.sender.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {message.sender.type}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: id
                          })}
                        </div>
                      </div>

                      <div className="text-sm text-gray-700">
                        {highlightText(
                          formatMessagePreview(message.content.text),
                          query
                        )}
                      </div>

                      {message.content.media_url && (
                        <div className="mt-2 text-xs text-blue-600">
                          📎 {message.content.media_type || 'File'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Mulai mengetik untuk mencari pesan</p>
              <p className="text-sm text-gray-400 mt-1">
                Gunakan filter untuk hasil yang lebih spesifik
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationSearch;
