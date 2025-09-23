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
  Badge,
  Alert,
  AlertDescription
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
  Workflow,
  Plus,
  Star,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import { sanitizeInput, validateInput } from '@/utils/securityUtils';
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
    n8n_workflow_id: null,
    waha_session_id: null,
    knowledge_base_item_id: null
  });

  // Related data states
  const [wahaSessions, setWahaSessions] = useState([]);
  const [knowledgeBaseItems, setKnowledgeBaseItems] = useState([]);
  const [n8nWorkflows, setN8nWorkflows] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);

  // Search states for assignment
  const [wahaSessionSearch, setWahaSessionSearch] = useState('');
  const [knowledgeBaseSearch, setKnowledgeBaseSearch] = useState('');
  const [n8nWorkflowSearch, setN8nWorkflowSearch] = useState('');

  // Filtered data based on search
  const filteredWahaSessions = wahaSessions.filter(session =>
    session.name?.toLowerCase().includes(wahaSessionSearch.toLowerCase()) ||
    session.session_name?.toLowerCase().includes(wahaSessionSearch.toLowerCase())
  );

  const filteredKnowledgeBaseItems = knowledgeBaseItems.filter(item =>
    item.title?.toLowerCase().includes(knowledgeBaseSearch.toLowerCase()) ||
    item.description?.toLowerCase().includes(knowledgeBaseSearch.toLowerCase())
  );

  const filteredN8nWorkflows = n8nWorkflows.filter(workflow =>
    workflow.name?.toLowerCase().includes(n8nWorkflowSearch.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(n8nWorkflowSearch.toLowerCase())
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
      const [wahaResponse, kbResponse, n8nResponse] = await Promise.all([
        botPersonalityService.getWahaSessions({ per_page: 100 }),
        botPersonalityService.getKnowledgeBaseItems({ per_page: 100 }),
        botPersonalityService.getN8nWorkflows({ per_page: 100 })
      ]);

      if (wahaResponse.success) {
        setWahaSessions(wahaResponse.data.data || []);
      }
      if (kbResponse.success) {
        setKnowledgeBaseItems(kbResponse.data.data || []);
      }
      if (n8nResponse.success) {
        setN8nWorkflows(n8nResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error loading related data:', error);
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
        n8n_workflow_id: null,
        waha_session_id: null,
        knowledge_base_item_id: null
      });
      setErrors({});
      setWahaSessionSearch('');
      setKnowledgeBaseSearch('');
      setN8nWorkflowSearch('');
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

  const getSelectedN8nWorkflow = () => {
    return n8nWorkflows.find(workflow => workflow.id === formData.n8n_workflow_id);
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
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search WhatsApp sessions..."
                      value={wahaSessionSearch}
                      onChange={(e) => setWahaSessionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {loadingRelatedData ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Loading WhatsApp sessions...
                      </div>
                    ) : filteredWahaSessions.length > 0 ? (
                      filteredWahaSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            formData.waha_session_id === session.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => handleAssignmentChange('waha_session_id',
                            formData.waha_session_id === session.id ? null : session.id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{session.name || session.session_name}</div>
                              <div className="text-sm text-gray-500">
                                {session.status || 'Active'} • {session.phone_number || 'No phone'}
                              </div>
                            </div>
                            {formData.waha_session_id === session.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No WhatsApp sessions found
                      </div>
                    )}
                  </div>
                  {formData.waha_session_id && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {getSelectedWahaSession()?.name || getSelectedWahaSession()?.session_name}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignmentChange('waha_session_id', null)}
                      >
                        <X className="w-4 h-4" />
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
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search knowledge base items..."
                      value={knowledgeBaseSearch}
                      onChange={(e) => setKnowledgeBaseSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {loadingRelatedData ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Loading knowledge base items...
                      </div>
                    ) : filteredKnowledgeBaseItems.length > 0 ? (
                      filteredKnowledgeBaseItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            formData.knowledge_base_item_id === item.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => handleAssignmentChange('knowledge_base_item_id',
                            formData.knowledge_base_item_id === item.id ? null : item.id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-gray-500">
                                {item.type || 'Article'} • {item.status || 'Published'}
                              </div>
                            </div>
                            {formData.knowledge_base_item_id === item.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No knowledge base items found
                      </div>
                    )}
                  </div>
                  {formData.knowledge_base_item_id && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">
                        <Database className="w-3 h-3 mr-1" />
                        {getSelectedKnowledgeBaseItem()?.title}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignmentChange('knowledge_base_item_id', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* N8N Workflow Assignment */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-orange-600" />
                  N8N Workflow
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search N8N workflows..."
                      value={n8nWorkflowSearch}
                      onChange={(e) => setN8nWorkflowSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {loadingRelatedData ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Loading N8N workflows...
                      </div>
                    ) : filteredN8nWorkflows.length > 0 ? (
                      filteredN8nWorkflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            formData.n8n_workflow_id === workflow.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => handleAssignmentChange('n8n_workflow_id',
                            formData.n8n_workflow_id === workflow.id ? null : workflow.id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{workflow.name}</div>
                              <div className="text-sm text-gray-500">
                                {workflow.status || 'Active'} • {workflow.nodes?.length || 0} nodes
                              </div>
                            </div>
                            {formData.n8n_workflow_id === workflow.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No N8N workflows found
                      </div>
                    )}
                  </div>
                  {formData.n8n_workflow_id && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        <Workflow className="w-3 h-3 mr-1" />
                        {getSelectedN8nWorkflow()?.name}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignmentChange('n8n_workflow_id', null)}
                      >
                        <X className="w-4 h-4" />
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
