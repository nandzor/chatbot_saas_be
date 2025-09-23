/**
 * Edit Knowledge Dialog
 * Dialog untuk mengedit knowledge item
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Switch,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  FileText,
  MessageSquare,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
  Tag,
  X,
  Brain,
  Target,
  TrendingUp,
  Globe,
  Eye,
  Hash,
  AlertCircle,
  Sparkles,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import { sanitizeInput } from '@/utils/securityUtils';
import TestChatbotResponse from '@/components/knowledge/TestChatbotResponse';

const EditKnowledgeDialog = ({ open, onOpenChange, knowledgeItem, onKnowledgeUpdated, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    content_type: 'article',
    category_id: '',
    priority: 'medium',
    tags: [],
    language: 'en',
    is_public: true,
    requires_approval: false,
    workflow_status: 'draft'
  });

  // QA-specific state
  const [qaItems, setQaItems] = useState([
    { question: '', answer: '' }
  ]);
  const [newTag, setNewTag] = useState('');

  // Initialize form data when knowledgeItem changes
  useEffect(() => {
    if (knowledgeItem && open) {
      setFormData({
        title: knowledgeItem.title || '',
        description: knowledgeItem.description || '',
        content: knowledgeItem.content || '',
        content_type: knowledgeItem.content_type || 'article',
        category_id: knowledgeItem.category_id?.toString() || '',
        priority: knowledgeItem.priority || 'medium',
        tags: knowledgeItem.tags || [],
        language: knowledgeItem.language || 'en',
        is_public: knowledgeItem.is_public || false,
        requires_approval: knowledgeItem.requires_approval || false,
        workflow_status: knowledgeItem.workflow_status || 'draft'
      });

      // Handle QA items
      if (knowledgeItem.content_type === 'qa_collection' && knowledgeItem.qa_items) {
        setQaItems(knowledgeItem.qa_items.length > 0 ? knowledgeItem.qa_items : [{ question: '', answer: '' }]);
      } else {
        setQaItems([{ question: '', answer: '' }]);
      }

      setNewTag('');
      setErrors({});
    }
  }, [knowledgeItem, open]);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Handle QA item changes
  const handleQAItemChange = useCallback((index, field, value) => {
    const sanitizedValue = sanitizeInput(value);
    setQaItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: sanitizedValue } : item
    ));
  }, []);

  // Add QA item
  const addQAItem = useCallback(() => {
    setQaItems(prev => [...prev, { question: '', answer: '' }]);
  }, []);

  // Remove QA item
  const removeQAItem = useCallback((index) => {
    setQaItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle tag management
  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, sanitizeInput(newTag.trim())]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.content_type === 'article') {
      if (!formData.content.trim()) {
        newErrors.content = 'Content is required for articles';
      } else if (formData.content.length < 50) {
        newErrors.content = 'Content must be at least 50 characters';
      }
    } else if (formData.content_type === 'qa_collection') {
      const validQAItems = qaItems.filter(item =>
        item.question.trim() && item.answer.trim()
      );
      if (validQAItems.length === 0) {
        newErrors.qaItems = 'At least one valid Q&A pair is required';
      }
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, qaItems]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };

      // Handle QA collection data
      if (formData.content_type === 'qa_collection') {
        submitData.qa_items = qaItems.filter(item =>
          item.question.trim() && item.answer.trim()
        );
        submitData.content = ''; // Clear content for QA collections
      }

      await onKnowledgeUpdated(submitData);
    } catch (error) {
      handleError(error, 'Failed to update knowledge item');
    } finally {
      setLoading(false);
    }
  }, [formData, qaItems, validateForm, onKnowledgeUpdated]);

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Indonesian' }
  ];

  if (!knowledgeItem) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-8">
          {/* Enhanced Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Knowledge
                </h2>
                <p className="text-gray-600 mt-1">
                  Perbarui informasi knowledge yang sudah ada
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress Form</span>
              <span className="text-sm text-gray-500">
                {formData.content_type === 'qa_collection' ? 'Step 1 of 2' : 'Step 2 of 2'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: formData.content_type === 'qa_collection' ? '50%' : '100%' }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Judul Knowledge *
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Pertanyaan Seputar Gadai Emas, Panduan Lengkap Pembayaran Cicilan"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  required
                />
                {errors.title && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Deskripsi Singkat *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan secara singkat tentang knowledge ini (maksimal 200 karakter)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  maxLength={200}
                  className={errors.description ? 'border-red-500' : ''}
                  required
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formData.description.length}/200 karakter</span>
                  {errors.description && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>
              {/* Category and Priority */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  Kategori *
                </Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <div className="flex items-center gap-2">
                        {c.icon ? <span className="w-4 h-4" /> : null}
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                {errors.category_id && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Prioritas
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Language and Visibility */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Bahasa
                </Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  Visibilitas
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isPublic"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                    />
                    <Label htmlFor="isPublic">Knowledge Publik</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="requiresApproval"
                      checked={formData.requires_approval}
                      onCheckedChange={(checked) => handleInputChange('requires_approval', checked)}
                    />
                    <Label htmlFor="requiresApproval">Perlu Persetujuan</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                Tags *
              </Label>
              <div className="space-y-3">
                {/* Current Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik tag dan tekan Enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                  >
                    Tambah
                  </Button>
                </div>

                {/* Tag Suggestions */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Tag yang sering digunakan:</p>
                  <div className="flex flex-wrap gap-2">
                    {['FAQ', 'Pembayaran', 'Akun', 'Produk', 'Layanan', 'Cara', 'Panduan', 'Informasi'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {errors.tags && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.tags}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            {/* Tab Interface */}
            <Tabs value={formData.content_type === 'article' ? 'article' : 'qa'} onValueChange={(value) => handleInputChange('content_type', value === 'article' ? 'article' : 'qa_collection')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qa" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Input Q&A
                </TabsTrigger>
                <TabsTrigger value="article" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Input Knowledge
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Input Q&A */}
              <TabsContent value="qa" className="space-y-6 mt-6">
                <div className="space-y-4">
                  {qaItems.map((item, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Q&A #{index + 1}</CardTitle>
                              <p className="text-sm text-gray-500">Pertanyaan dan jawaban untuk bot</p>
                            </div>
                          </div>
                          {qaItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQAItem(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${index}`} className="text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            Pertanyaan *
                          </Label>
                          <Input
                            id={`question-${index}`}
                            placeholder="Masukkan pertanyaan yang sering diajukan..."
                            value={item.question}
                            onChange={(e) => handleQAItemChange(index, 'question', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`answer-${index}`} className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-600" />
                            Jawaban *
                          </Label>
                          <Textarea
                            id={`answer-${index}`}
                            placeholder="Berikan jawaban yang jelas dan lengkap..."
                            value={item.answer}
                            onChange={(e) => handleQAItemChange(index, 'answer', e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQAItem}
                    className="w-full border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Q&A Lainnya
                  </Button>

                  {errors.qaItems && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.qaItems}
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Input Knowledge Article */}
              <TabsContent value="article" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      Konten Knowledge *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Tuliskan konten knowledge yang detail dan informatif..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={15}
                      className={errors.content ? 'border-red-500' : ''}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.content}
                      </p>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Jumlah karakter: {formData.content.length}</span>
                      <span>Minimal 50 karakter</span>
                    </div>
                  </div>

                  {/* Test Chatbot Response Component */}
                  <TestChatbotResponse knowledgeContent={formData.content} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Enhanced Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Semua informasi akan tersimpan dengan aman</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="px-6"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditKnowledgeDialog;
