/**
 * View Knowledge Details Dialog
 * Optimized dialog untuk melihat detail knowledge item dengan UX yang lebih baik
 */

import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Edit,
  Tag,
  Globe,
  Shield,
  Clock,
  User,
  Calendar,
  Zap,
  Target,
  AlertCircle,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG
} from './constants';

const ViewKnowledgeDetailsDialog = ({ open, onOpenChange, knowledgeItem, onEdit }) => {
  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

  const getStatusBadge = useCallback((status) => {
    const config = STATUS_CONFIG[status] || { variant: 'outline', icon: AlertCircle, label: status };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  }, []);

  const getPriorityBadge = useCallback((priority) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

    return (
      <Badge variant="outline" className={`${config.color} ${config.bg}`}>
        {config.label}
      </Badge>
    );
  }, []);

  if (!knowledgeItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Knowledge Item Details</span>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this knowledge item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusBadge(knowledgeItem.workflow_status)}
              {getPriorityBadge(knowledgeItem.priority)}
              <Badge variant={knowledgeItem.is_public ? 'default' : 'secondary'}>
                {knowledgeItem.is_public ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Private
                  </>
                )}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(knowledgeItem.title)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Title
              </Button>
              {onEdit && (
                <Button size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Title and Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{knowledgeItem.title}</CardTitle>
              <CardDescription className="text-base">
                {knowledgeItem.description}
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {knowledgeItem.content_type === 'article' ? (
                          <>
                            <FileText className="h-4 w-4" />
                            <span>Article</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4" />
                            <span>Q&A Collection</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag className="h-4 w-4" />
                        <span>{knowledgeItem.category?.name || 'General'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Language</label>
                      <div className="mt-1">
                        <span className="capitalize">{knowledgeItem.language || 'en'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Requires Approval</label>
                      <div className="mt-1">
                        <Badge variant={knowledgeItem.requires_approval ? 'default' : 'secondary'}>
                          {knowledgeItem.requires_approval ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Tag className="h-5 w-5" />
                      <span>Tags</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {knowledgeItem.tags && knowledgeItem.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {knowledgeItem.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No tags assigned</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Author and Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Author & Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created By</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4" />
                        <span>{knowledgeItem.author?.full_name || 'Unknown'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(knowledgeItem.created_at)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(knowledgeItem.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {knowledgeItem.content_type === 'article' ? 'Article Content' : 'Q&A Collection'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {knowledgeItem.content_type === 'article' ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {knowledgeItem.content || 'No content available'}
                      </div>
                      {knowledgeItem.word_count && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-500">
                            Word count: {knowledgeItem.word_count}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {knowledgeItem.qa_items && knowledgeItem.qa_items.length > 0 ? (
                        knowledgeItem.qa_items.map((qa, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                  <Target className="h-4 w-4" />
                                  <span>Question {index + 1}</span>
                                </label>
                                <p className="mt-1 text-gray-700">{qa.question}</p>
                              </div>
                              <Separator />
                              <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                  <Zap className="h-4 w-4" />
                                  <span>Answer</span>
                                </label>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{qa.answer}</p>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No Q&A pairs available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Technical Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {knowledgeItem.id}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(knowledgeItem.id.toString())}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Version</label>
                      <div className="mt-1">
                        <Badge variant="outline">{knowledgeItem.version || 1}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Content Type</label>
                      <div className="mt-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {knowledgeItem.content_type}
                        </code>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category ID</label>
                      <div className="mt-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {knowledgeItem.category_id || 'N/A'}
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewKnowledgeDetailsDialog;
