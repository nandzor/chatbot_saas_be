/**
 * Create Bot Personality Dialog
 * Dialog untuk membuat bot personality baru dengan assignment features
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  Textarea,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  Bot,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  X,
  MessageSquare,
  Database,
  Plus,
  Settings,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import { sanitizeInput } from '@/utils/securityUtils';
import BotPersonalityService from '@/services/BotPersonalityService';

const botPersonalityService = new BotPersonalityService();

const CreateBotPersonalityDialog = ({ open, onOpenChange, onPersonalityCreated }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    display_name: '',
    description: '',
    language: 'english',
    formality_level: 'formal',
    color_scheme: { primary: '#3B82F6' },
    personality_traits: [],
    response_delay_ms: 1000,
    typing_indicator: true,
    max_response_length: 1000,
    enable_small_talk: true,
    confidence_threshold: 0.8,
    learning_enabled: true,
    status: 'active',
    is_default: false,
    // Assignment fields
    waha_session_id: null,
    knowledge_base_item_id: null
  });

  // Related data states
  const [wahaSessions, setWahaSessions] = useState([]);
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);

  // Search states for assignment
  const [wahaSessionSearch, setWahaSessionSearch] = useState('');
  const [knowledgeBaseSearch, setKnowledgeBaseSearch] = useState('');

  // Filtered data based on search
  const filteredWahaSessions = wahaSessions.filter(session =>
    session.name?.toLowerCase().includes(wahaSessionSearch.toLowerCase()) ||
    session.session_name?.toLowerCase().includes(wahaSessionSearch.toLowerCase())
  );

  const filteredKnowledgeBaseItems = knowledgeBaseItems.filter(item =>
    item.title?.toLowerCase().includes(knowledgeBaseSearch.toLowerCase()) ||
    item.description?.toLowerCase().includes(knowledgeBaseSearch.toLowerCase())
  );


  // Load related data when dialog opens
  useEffect(() => {
    if (open) {
      loadRelatedData();
    }
  }, [open]);

  const loadRelatedData = async () => {
    try {
      setLoadingRelatedData(true);

      // Load all related data in parallel
      const [wahaResponse, kbResponse] = await Promise.all([
        botPersonalityService.getWahaSessions({ per_page: 100 }),
        botPersonalityService.getKnowledgeBaseItems({ per_page: 100 })
      ]);

      if (wahaResponse.success) {
        // Handle both nested and direct data structure
        const wahaData = Array.isArray(wahaResponse.data) ? wahaResponse.data : (wahaResponse.data.data || []);
        setWahaSessions(wahaData);
      }
      if (kbResponse.success) {
        // Handle both nested and direct data structure
        const kbData = Array.isArray(kbResponse.data) ? kbResponse.data : (kbResponse.data.data || []);
        setKnowledgeBaseItems(kbData);
      }
    } catch (error) {
      toast.error('Failed to load related data');
    } finally {
      setLoadingRelatedData(false);
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        code: '',
        display_name: '',
        description: '',
        language: 'english',
        formality_level: 'formal',
        color_scheme: { primary: '#3B82F6' },
        personality_traits: [],
        response_delay_ms: 1000,
        typing_indicator: true,
        max_response_length: 1000,
        enable_small_talk: true,
        confidence_threshold: 0.8,
        learning_enabled: true,
        status: 'active',
        is_default: false,
        waha_session_id: null,
        knowledge_base_item_id: null
      });
      setErrors({});
      setWahaSessionSearch('');
      setKnowledgeBaseSearch('');
    }
  }, [open]);


  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Handle assignment changes
  const handleAssignmentChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Code must be at least 2 characters';
    } else if (!/^[a-z0-9_-]+$/i.test(formData.code)) {
      newErrors.code = 'Code can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = 'Display name must be at least 2 characters';
    }

    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    if (!formData.formality_level) {
      newErrors.formality_level = 'Formality level is required';
    }

    if (formData.max_response_length < 100) {
      newErrors.max_response_length = 'Max response length must be at least 100 characters';
    }

    if (formData.confidence_threshold < 0 || formData.confidence_threshold > 1) {
      newErrors.confidence_threshold = 'Confidence threshold must be between 0 and 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      const response = await botPersonalityService.create(formData);

      if (response.success) {
        toast.success('Bot personality created successfully');
        onPersonalityCreated(response.data);
        onOpenChange(false);
      } else {
        throw new Error(response.message || 'Failed to create bot personality');
      }
    } catch (error) {
      handleError(error, { context: 'Create Bot Personality' });
    } finally {
      setLoading(false);
    }
  };

  // Get selected items for display
  const getSelectedWahaSession = () => {
    return wahaSessions.find(session => session.id === formData.waha_session_id);
  };

  const getSelectedKnowledgeBaseItem = () => {
    return knowledgeBaseItems.find(item => item.id === formData.knowledge_base_item_id);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Create New Bot Personality
          </DialogTitle>
          <DialogDescription>
            Create a new bot personality with AI assistant configuration and integrations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Configure the basic settings for your bot personality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Customer Support Bot"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., customer-support-bot"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.code}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    placeholder="e.g., Customer Support Assistant"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className={errors.display_name ? 'border-red-500' : ''}
                  />
                  {errors.display_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.display_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language *</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="indonesia">Indonesia</SelectItem>
                    <SelectItem value="javanese">Javanese</SelectItem>
                    <SelectItem value="sundanese">Sundanese</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formality_level">Formality Level *</Label>
                  <Select
                    value={formData.formality_level}
                    onValueChange={(value) => handleInputChange('formality_level', value)}
                  >
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the bot personality's purpose and characteristics..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integrations & Assignments
              </CardTitle>
              <CardDescription>
                Connect this bot personality to external services and knowledge sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WhatsApp Session Assignment */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  WhatsApp Session
                  <span className="text-xs text-gray-500 font-normal">(Working only)</span>
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search working WhatsApp sessions..."
                      value={wahaSessionSearch}
                      onChange={(e) => setWahaSessionSearch(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                      {loadingRelatedData ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-green-600" />
                            <p className="text-sm text-gray-500">Loading working WhatsApp sessions...</p>
                          </div>
                        </div>
                      ) : filteredWahaSessions.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {filteredWahaSessions.map((session) => (
                            <div
                              key={session.id}
                              className={`group p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                                formData.waha_session_id === session.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAssignmentChange('waha_session_id',
                                  formData.waha_session_id === session.id ? null : session.id
                                );
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                                      {session.name || session.session_name}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                      {session.status || 'Working'}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                                      WhatsApp
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3 flex-shrink-0">
                                  {formData.waha_session_id === session.id ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-green-400 transition-colors" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm text-gray-500">No working WhatsApp sessions found</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Try a different search term
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  {formData.waha_session_id && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">
                            {getSelectedWahaSession()?.name || getSelectedWahaSession()?.session_name}
                          </p>
                          <p className="text-xs text-green-600">Selected WhatsApp session</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignmentChange('waha_session_id', null)}
                        className="h-8 w-8 p-0 hover:bg-green-100"
                      >
                        <X className="w-4 h-4 text-green-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Knowledge Base Item Assignment */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  Knowledge Base Item
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search published knowledge base items..."
                      value={knowledgeBaseSearch}
                      onChange={(e) => setKnowledgeBaseSearch(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                    {loadingRelatedData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-purple-600" />
                          <p className="text-sm text-gray-500">Loading published knowledge base items...</p>
                        </div>
                      </div>
                    ) : filteredKnowledgeBaseItems.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {filteredKnowledgeBaseItems.map((item) => (
                          <div
                            key={item.id}
                            className={`group p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                              formData.knowledge_base_item_id === item.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAssignmentChange('knowledge_base_item_id',
                                formData.knowledge_base_item_id === item.id ? null : item.id
                              );
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Database className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {item.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                                    {item.type || 'Article'}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                    {item.status || 'Published'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 flex-shrink-0">
                                {formData.knowledge_base_item_id === item.id ? (
                                  <CheckCircle className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-purple-400 transition-colors" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Database className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-gray-500">No knowledge base items found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Try a different search term
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.knowledge_base_item_id && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Database className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-purple-900 truncate">
                            {getSelectedKnowledgeBaseItem()?.title}
                          </p>
                          <p className="text-xs text-purple-600">Selected knowledge base item</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignmentChange('knowledge_base_item_id', null)}
                        className="h-8 w-8 p-0 hover:bg-purple-100"
                      >
                        <X className="w-4 h-4 text-purple-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced bot personality settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_response_length">Max Response Length</Label>
                  <Input
                    id="max_response_length"
                    type="number"
                    min="100"
                    max="5000"
                    value={formData.max_response_length}
                    onChange={(e) => handleInputChange('max_response_length', parseInt(e.target.value))}
                    className={errors.max_response_length ? 'border-red-500' : ''}
                  />
                  {errors.max_response_length && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.max_response_length}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response_delay_ms">Response Delay (ms)</Label>
                  <Input
                    id="response_delay_ms"
                    type="number"
                    min="0"
                    max="10000"
                    value={formData.response_delay_ms}
                    onChange={(e) => handleInputChange('response_delay_ms', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence_threshold">Confidence Threshold</Label>
                  <Input
                    id="confidence_threshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.confidence_threshold}
                    onChange={(e) => handleInputChange('confidence_threshold', parseFloat(e.target.value))}
                    className={errors.confidence_threshold ? 'border-red-500' : ''}
                  />
                  {errors.confidence_threshold && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confidence_threshold}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bot Personality
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBotPersonalityDialog;
