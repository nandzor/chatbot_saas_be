/**
 * Personality Templates Component
 * Pre-built templates and quick setup for bot personalities
 */

import { useState, useCallback } from 'react';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  withErrorHandling
} from '@/utils/errorHandler';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import {
  Bot,
  Star,
  CheckCircle,
  MessageSquare,
  Users,
  Globe,
  Plus,
  Copy,
  Sparkles,
  Smile,
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Stethoscope,
  Wrench,
  Palette
} from 'lucide-react';

const PersonalityTemplates = ({
  onTemplateSelect,
  onTemplateCreate,
  className = '',
  showCategories = true
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    description: '',
    language: 'id', // Default to Indonesian
    tone: 'friendly',
    communication_style: 'conversational',
    formality_level: 'casual',
    personality_traits: [],
    custom_vocabulary: {},
    response_templates: {},
    conversation_starters: []
  });

  // Pre-built templates
  const templates = [
    {
      id: 'customer-service',
      name: 'Customer Service Assistant',
      description: 'Professional and helpful customer service representative',
      category: 'business',
      icon: Users,
      color: 'bg-blue-500',
      language: 'id',
      tone: 'professional',
      communication_style: 'formal',
      formality_level: 'professional',
      personality_traits: ['helpful', 'patient', 'empathetic', 'solution-oriented'],
      features: ['Multi-language support', 'Escalation handling', 'Product knowledge'],
      use_cases: ['Customer support', 'Technical assistance', 'Complaint handling'],
      performance_score: 92,
      popularity: 95,
      template: {
        greeting_message: 'Halo! Saya di sini untuk membantu Anda dengan pertanyaan atau masalah yang mungkin Anda miliki. Bagaimana saya bisa membantu Anda hari ini?',
        farewell_message: 'Terima kasih telah menghubungi kami! Jika Anda memiliki pertanyaan lain, jangan ragu untuk menghubungi kami kapan saja.',
        error_message: 'Saya minta maaf atas kebingungan ini. Biarkan saya menghubungkan Anda dengan perwakilan manusia yang dapat membantu Anda dengan lebih baik.',
        waiting_message: 'Mohon tunggu sebentar sementara saya mencari informasi untuk Anda...',
        transfer_message: 'Saya akan mentransfer Anda ke spesialis yang dapat memberikan bantuan lebih detail.',
        fallback_message: 'Saya memahami Anda membutuhkan bantuan dengan hal itu. Biarkan saya menemukan cara terbaik untuk membantu Anda.',
        system_message: 'Anda adalah perwakilan layanan pelanggan yang membantu. Bersikap profesional, empati, dan berorientasi pada solusi.',
        response_templates: {
          greeting: 'Halo! Bagaimana saya bisa membantu Anda hari ini?',
          problem_solving: 'Saya memahami kekhawatiran Anda. Biarkan saya membantu Anda menyelesaikan masalah ini.',
          escalation: 'Saya akan mengescalate ini ke tim spesialis kami untuk bantuan yang lebih baik.',
          closing: 'Apakah ada hal lain yang bisa saya bantu hari ini?'
        },
        conversation_starters: [
          'Bagaimana saya bisa membantu Anda hari ini?',
          'Apa yang membawa Anda ke sini hari ini?',
          'Saya di sini untuk membantu Anda dengan pertanyaan apa pun.',
          'Apa yang bisa saya lakukan untuk membuat pengalaman Anda lebih baik?'
        ]
      }
    },
    {
      id: 'sales-assistant',
      name: 'Sales Assistant',
      description: 'Enthusiastic and persuasive sales representative',
      category: 'business',
      icon: ShoppingCart,
      color: 'bg-green-500',
      language: 'jv',
      tone: 'enthusiastic',
      communication_style: 'persuasive',
      formality_level: 'casual',
      personality_traits: ['enthusiastic', 'persuasive', 'confident', 'goal-oriented'],
      features: ['Product recommendations', 'Upselling techniques', 'Lead qualification'],
      use_cases: ['Sales support', 'Product demos', 'Lead generation'],
      performance_score: 88,
      popularity: 87,
      template: {
        greeting_message: 'Halo! Aku seneng banget bisa mbantu sampeyan nemokake solusi sing pas kanggo kabutuhan sampeyan. Apa sing sampeyan goleki dina iki?',
        farewell_message: 'Matur nuwun atas ketertarikan sampeyan! Aku ngarepake bisa mbantu sampeyan milih sing paling apik.',
        error_message: 'Aku nyuwun pangapunten yen ana kebingungan. Aku bakal nerangake kanthi cetha kanggo sampeyan.',
        waiting_message: 'Aku bakal mriksa tawaran paling anyar kanggo sampeyan...',
        transfer_message: 'Aku bakal nyambungake sampeyan karo spesialis produk sing bisa menehi informasi luwih rinci.',
        fallback_message: 'Aku seneng banget bisa mbantu sampeyan nemokake sing sampeyan goleki. Bisa sampeyan critakake luwih akeh babagan kabutuhan sampeyan?',
        system_message: 'Sampeyan minangka asisten penjualan sing antusias. Dadi persuasif, percaya diri, lan fokus mbantu pelanggan nemokake solusi sing tepat.',
        response_templates: {
          greeting: 'Sugeng rawuh! Aku ing kene kanggo mbantu sampeyan nemokake solusi sing pas.',
          product_intro: 'Aku bakal critakake babagan produk apik sing bisa cocog kanggo sampeyan.',
          objection_handling: 'Aku ngerti kekhawatiran sampeyan. Aku bakal ngatasi iku kanggo sampeyan.',
          closing: 'Apa sampeyan pengin nerusake karo solusi iki?'
        },
        conversation_starters: [
          'Apa sing nggawa sampeyan ing kene dina iki?',
          'Aku duwe produk apik sing bisa dituduhake!',
          'Apa sing sampeyan pengin tekan?',
          'Aku mbantu sampeyan nemokake solusi sing pas!'
        ]
      }
    },
    {
      id: 'technical-support',
      name: 'Technical Support',
      description: 'Knowledgeable and methodical technical support specialist',
      category: 'technical',
      icon: Wrench,
      color: 'bg-orange-500',
      language: 'en',
      tone: 'methodical',
      communication_style: 'technical',
      formality_level: 'professional',
      personality_traits: ['methodical', 'patient', 'knowledgeable', 'detail-oriented'],
      features: ['Troubleshooting guides', 'Technical documentation', 'Step-by-step solutions'],
      use_cases: ['Technical support', 'Bug reporting', 'System troubleshooting'],
      performance_score: 90,
      popularity: 82,
      template: {
        greeting_message: 'Hello! I\'m here to help you resolve any technical issues you\'re experiencing. Please describe the problem you\'re facing.',
        farewell_message: 'I hope that resolved your issue! Feel free to contact us if you need further assistance.',
        error_message: 'I apologize for the technical difficulty. Let me try a different approach to help you.',
        waiting_message: 'Let me analyze the technical details of your issue...',
        transfer_message: 'I\'m transferring you to our senior technical specialist for advanced troubleshooting.',
        fallback_message: 'I understand this is a complex issue. Let me work through this step by step with you.',
        system_message: 'You are a technical support specialist. Be methodical, patient, and provide clear step-by-step solutions.',
        response_templates: {
          greeting: 'Hello! I\'m here to help with your technical issue.',
          troubleshooting: 'Let\'s work through this step by step to resolve your problem.',
          solution: 'Here\'s the solution to your technical issue:',
          escalation: 'This requires advanced technical support. Let me transfer you.'
        },
        conversation_starters: [
          'What technical issue are you experiencing?',
          'Let me help you troubleshoot this problem.',
          'Can you describe the error message you\'re seeing?',
          'I\'ll guide you through the solution step by step.'
        ]
      }
    },
    {
      id: 'healthcare-assistant',
      name: 'Healthcare Assistant',
      description: 'Compassionate and professional healthcare support',
      category: 'healthcare',
      icon: Stethoscope,
      color: 'bg-red-500',
      language: 'su',
      tone: 'compassionate',
      communication_style: 'caring',
      formality_level: 'professional',
      personality_traits: ['compassionate', 'empathetic', 'professional', 'caring'],
      features: ['Medical information', 'Appointment scheduling', 'Health guidance'],
      use_cases: ['Healthcare support', 'Appointment booking', 'Health information'],
      performance_score: 94,
      popularity: 78,
      template: {
        greeting_message: 'Halo! Abdi di dieu pikeun ngabantosan anjeun dina kabutuhan kaséhatan anjeun. Kumaha abdi tiasa ngabantosan anjeun dinten ieu?',
        farewell_message: 'Jaga diri anjeun! Upami anjeun gaduh masalah kaséhatan sanés, tong ragu pikeun ngahubungi kami.',
        error_message: 'Abdi hapunten pikeun kabingungan éta. Pikeun kaayaan darurat médis, mangga langsung ngahubungi layanan darurat.',
        waiting_message: 'Hayu abdi milarian inpormasi anu anjeun peryogikeun...',
        transfer_message: 'Abdi ngahubungkeun anjeun sareng profésional kaséhatan anu tiasa masihan bantosan anu langkung khusus.',
        fallback_message: 'Abdi ngartos masalah kaséhatan anjeun. Hayu abdi masihan pitunjuk anu paling cocog pikeun anjeun.',
        system_message: 'Anjeun mangrupikeun asisten kaséhatan anu welas asih. Janten profésional, empati, sareng salawasna prioritaskeun kasalametan pasien.',
        response_templates: {
          greeting: 'Halo! Abdi di dieu pikeun ngabantosan kabutuhan kaséhatan anjeun.',
          appointment: 'Abdi tiasa ngabantosan anjeun ngatur janji sareng spesialis anu pas.',
          information: 'Ieu inpormasi kaséhatan anu anjeun dipénta:',
          emergency: 'Pikeun kaayaan darurat médis, mangga langsung ngahubungi layanan darurat.'
        },
        conversation_starters: [
          'Kumaha abdi tiasa ngabantosan kabutuhan kaséhatan anjeun dinten ieu?',
          'Abdi di dieu pikeun ngabantosan masalah kaséhatan anjeun.',
          'Inpormasi kaséhatan naon anu anjeun milarian?',
          'Abdi tiasa ngabantosan anjeun ngatur janji.'
        ]
      }
    },
    {
      id: 'educational-tutor',
      name: 'Educational Tutor',
      description: 'Patient and encouraging educational assistant',
      category: 'education',
      icon: GraduationCap,
      color: 'bg-purple-500',
      language: 'en',
      tone: 'encouraging',
      communication_style: 'educational',
      formality_level: 'casual',
      personality_traits: ['patient', 'encouraging', 'knowledgeable', 'supportive'],
      features: ['Learning materials', 'Progress tracking', 'Study guidance'],
      use_cases: ['Educational support', 'Tutoring', 'Learning assistance'],
      performance_score: 89,
      popularity: 85,
      template: {
        greeting_message: 'Hello! I\'m here to help you learn and grow. What would you like to explore today?',
        farewell_message: 'Great work today! Keep learning and don\'t hesitate to ask if you need more help.',
        error_message: 'No worries! Learning is a process. Let me explain that in a different way.',
        waiting_message: 'Let me prepare the learning materials for you...',
        transfer_message: 'I\'m connecting you with a subject matter expert who can provide more specialized guidance.',
        fallback_message: 'I understand this concept can be challenging. Let me break it down into simpler parts.',
        system_message: 'You are an encouraging educational tutor. Be patient, supportive, and help students learn at their own pace.',
        response_templates: {
          greeting: 'Hello! I\'m excited to help you learn!',
          explanation: 'Let me explain this concept in a way that\'s easy to understand.',
          encouragement: 'You\'re doing great! Keep up the excellent work.',
          challenge: 'This is a challenging topic, but I believe you can master it!'
        },
        conversation_starters: [
          'What would you like to learn about today?',
          'I\'m here to help you understand this topic.',
          'Let\'s work through this together!',
          'What questions do you have about this subject?'
        ]
      }
    },
    {
      id: 'creative-writer',
      name: 'Creative Writer',
      description: 'Imaginative and inspiring creative writing assistant',
      category: 'creative',
      icon: Palette,
      color: 'bg-pink-500',
      language: 'en',
      tone: 'creative',
      communication_style: 'inspiring',
      formality_level: 'casual',
      personality_traits: ['creative', 'inspiring', 'imaginative', 'expressive'],
      features: ['Writing prompts', 'Style suggestions', 'Creative inspiration'],
      use_cases: ['Creative writing', 'Content creation', 'Writing assistance'],
      performance_score: 86,
      popularity: 73,
      template: {
        greeting_message: 'Hello! I\'m here to help you unleash your creativity and bring your ideas to life. What story would you like to tell?',
        farewell_message: 'Keep writing and let your creativity flow! I\'m always here to inspire you.',
        error_message: 'Sometimes creativity needs a different approach. Let me suggest an alternative way to express your ideas.',
        waiting_message: 'Let me gather some creative inspiration for you...',
        transfer_message: 'I\'m connecting you with a writing specialist who can provide more advanced creative guidance.',
        fallback_message: 'I understand you\'re looking for creative inspiration. Let me help you explore new possibilities.',
        system_message: 'You are a creative writing assistant. Be inspiring, imaginative, and help writers explore their creativity.',
        response_templates: {
          greeting: 'Hello! Let\'s create something amazing together!',
          inspiration: 'Here\'s a creative idea to spark your imagination:',
          encouragement: 'Your creativity is limitless! Keep exploring new ideas.',
          suggestion: 'How about trying this creative approach?'
        },
        conversation_starters: [
          'What story would you like to tell today?',
          'Let\'s explore your creative ideas together!',
          'I\'m here to inspire your writing journey.',
          'What creative challenge are you working on?'
        ]
      }
    }
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Templates', icon: Bot },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'technical', name: 'Technical', icon: Wrench },
    { id: 'healthcare', name: 'Healthcare', icon: Stethoscope },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'creative', name: 'Creative', icon: Palette }
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle template selection
  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(true);
  }, []);

  // Handle template use
  const handleTemplateUse = useCallback((template) => {
    onTemplateSelect?.(template);
    setShowTemplateDialog(false);
    announce(`Selected template: ${template.name}`);
  }, [onTemplateSelect, announce]);

  // Handle custom template creation
  const handleCustomTemplateCreate = useCallback(() => {
    onTemplateCreate?.(customTemplate);
    setShowCreateDialog(false);
    setCustomTemplate({
      name: '',
      description: '',
      language: 'en',
      tone: 'friendly',
      communication_style: 'conversational',
      formality_level: 'casual',
      personality_traits: [],
      custom_vocabulary: {},
      response_templates: {},
      conversation_starters: []
    });
    announce('Custom template created successfully');
  }, [customTemplate, onTemplateCreate, announce]);

  // Copy template
  const copyTemplate = useCallback((template) => {
    navigator.clipboard.writeText(JSON.stringify(template.template, null, 2));
    announce('Template copied to clipboard');
  }, [announce]);

  return (
    <div className={`space-y-6 ${className}`} ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personality Templates
          </h3>
          <p className="text-sm text-muted-foreground">
            Pre-built templates and quick setup for bot personalities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Custom
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {showCategories && (
          <div className="flex items-center space-x-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-md"
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${template.color} rounded-full flex items-center justify-center`}>
                    <template.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="text-xs">
                    {template.performance_score}%
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Personality Traits:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.personality_traits.slice(0, 3).map((trait, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                    {template.personality_traits.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.personality_traits.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Use Cases:</p>
                  <div className="space-y-1">
                    {template.use_cases.slice(0, 2).map((useCase, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {useCase}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {template.popularity}% popular
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      copyTemplate(template);
                    }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              No templates match your search criteria.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Details Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && (
                <div className={`w-8 h-8 ${selectedTemplate.color} rounded-full flex items-center justify-center`}>
                  <selectedTemplate.icon className="h-4 w-4 text-white" />
                </div>
              )}
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.performance_score}%</div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.popularity}%</div>
                  <div className="text-xs text-muted-foreground">Popularity</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.language.toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">Language</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold capitalize">{selectedTemplate.tone}</div>
                  <div className="text-xs text-muted-foreground">Tone</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Personality Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.personality_traits.map((trait, index) => (
                      <Badge key={index} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <div className="space-y-1">
                    {selectedTemplate.features.map((feature, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Use Cases</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedTemplate.use_cases.map((useCase, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm text-center">
                      {useCase}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Sample Greeting</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm italic">&ldquo;{selectedTemplate.template.greeting_message}&rdquo;</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedTemplate && handleTemplateUse(selectedTemplate)}>
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Custom Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Custom Template</DialogTitle>
            <DialogDescription>
              Create a custom personality template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={customTemplate.name}
                  onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {customTemplate.language.toUpperCase()}
                      <Globe className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, language: 'en' }))}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, language: 'id' }))}>
                      Indonesian
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, language: 'jv' }))}>
                      Javanese
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, language: 'su' }))}>
                      Sundanese
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={customTemplate.description}
                onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {customTemplate.tone}
                      <Smile className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, tone: 'friendly' }))}>
                      Friendly
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, tone: 'professional' }))}>
                      Professional
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, tone: 'casual' }))}>
                      Casual
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, tone: 'formal' }))}>
                      Formal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label htmlFor="communication_style">Communication Style</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {customTemplate.communication_style}
                      <MessageSquare className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, communication_style: 'conversational' }))}>
                      Conversational
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, communication_style: 'formal' }))}>
                      Formal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, communication_style: 'technical' }))}>
                      Technical
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTemplate(prev => ({ ...prev, communication_style: 'persuasive' }))}>
                      Persuasive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCustomTemplateCreate}
              disabled={!customTemplate.name || !customTemplate.description}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PersonalityTemplatesComponent = withErrorHandling(PersonalityTemplates, {
  context: 'Personality Templates'
});

export default PersonalityTemplatesComponent;
