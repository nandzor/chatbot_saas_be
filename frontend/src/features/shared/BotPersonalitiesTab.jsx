import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch
} from '@/components/ui';
import { 
  Bot,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  X,
  Save,
  AlertTriangle,
  Info,
  Languages,
  Smile,
  Volume2
} from 'lucide-react';

const BotPersonalitiesTab = () => {
  // Sample data untuk Bot Personalities
  const [botPersonalities, setBotPersonalities] = useState([
    { 
      id: 1, 
      name: 'Ramah & Profesional', 
      language: 'ID', 
      tone: 'Formal', 
      greetingMessage: 'Halo! Selamat datang di layanan kami. Ada yang bisa saya bantu?', 
      errorMessage: 'Maaf, saya tidak memahami permintaan Anda. Bisakah Anda menjelaskan lebih detail?',
      fallbackMessage: 'Saya akan menghubungkan Anda dengan tim support kami.',
      isActive: true,
      created: '2024-03-15'
    },
    { 
      id: 2, 
      name: 'Casual & Friendly', 
      language: 'ID', 
      tone: 'Informal', 
      greetingMessage: 'Hai! Gimana kabarnya? Ada yang bisa dibantu?', 
      errorMessage: 'Waduh, saya kurang paham nih. Coba dijelasin lagi dong!',
      fallbackMessage: 'Tunggu sebentar ya, saya panggilin yang lebih expert!',
      isActive: false,
      created: '2024-03-10'
    },
  ]);

  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPersonality, setEditingPersonality] = useState(null);
  const [deletingPersonality, setDeletingPersonality] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    language: 'id',
    tone: 'formal',
    greetingMessage: '',
    errorMessage: '',
    fallbackMessage: '',
    isActive: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      language: 'id',
      tone: 'formal',
      greetingMessage: '',
      errorMessage: '',
      fallbackMessage: '',
      isActive: false
    });
  };

  const handleAddPersonality = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEditPersonality = (personality) => {
    setEditingPersonality(personality);
    setFormData({
      name: personality.name,
      language: personality.language.toLowerCase(),
      tone: personality.tone.toLowerCase(),
      greetingMessage: personality.greetingMessage,
      errorMessage: personality.errorMessage,
      fallbackMessage: personality.fallbackMessage,
      isActive: personality.isActive
    });
    setShowEditDialog(true);
  };

  const handleDeletePersonality = (personality) => {
    setDeletingPersonality(personality);
    setShowDeleteDialog(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const newPersonality = {
      id: Date.now(),
      name: formData.name,
      language: formData.language.toUpperCase(),
      tone: formData.tone.charAt(0).toUpperCase() + formData.tone.slice(1),
      greetingMessage: formData.greetingMessage,
      errorMessage: formData.errorMessage,
      fallbackMessage: formData.fallbackMessage,
      isActive: formData.isActive,
      created: new Date().toISOString().split('T')[0]
    };
    setBotPersonalities(prev => [...prev, newPersonality]);
    setShowAddDialog(false);
    resetForm();
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    setBotPersonalities(prev => prev.map(p => 
      p.id === editingPersonality.id 
        ? {
            ...p,
            name: formData.name,
            language: formData.language.toUpperCase(),
            tone: formData.tone.charAt(0).toUpperCase() + formData.tone.slice(1),
            greetingMessage: formData.greetingMessage,
            errorMessage: formData.errorMessage,
            fallbackMessage: formData.fallbackMessage,
            isActive: formData.isActive
          }
        : p
    ));
    setShowEditDialog(false);
    setEditingPersonality(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    setBotPersonalities(prev => prev.filter(p => p.id !== deletingPersonality.id));
    setShowDeleteDialog(false);
    setDeletingPersonality(null);
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setEditingPersonality(null);
    setDeletingPersonality(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Bot Personalities List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Bot Personalities
              </CardTitle>
              <CardDescription>Kelola bot_personalities untuk mengatur bahasa, tone, dan pesan sistem</CardDescription>
            </div>
            <Button onClick={handleAddPersonality}>
              <Plus className="w-4 h-4 mr-2" />
              Add Personality
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nama Personality</TableHead>
                  <TableHead className="min-w-[120px]">Bahasa</TableHead>
                  <TableHead className="min-w-[100px]">Tone</TableHead>
                  <TableHead className="min-w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {botPersonalities.map((personality) => (
                  <TableRow key={personality.id}>
                    <TableCell className="font-medium">{personality.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{personality.language}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{personality.tone}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPersonality(personality)}
                          title="Edit Personality"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeletePersonality(personality)}
                          title="Delete Personality"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* System Messages Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Pesan Sistem
          </CardTitle>
          <CardDescription>Konfigurasi greeting_message, error_message, dan pesan sistem lainnya</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <Label htmlFor="personality-select">Pilih Personality</Label>
            <Select 
              value={selectedPersonality.id.toString()} 
              onValueChange={(value) => {
                const personality = botPersonalities.find(p => p.id.toString() === value);
                if (personality) setSelectedPersonality(personality);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {botPersonalities.map((personality) => (
                  <SelectItem key={personality.id} value={personality.id.toString()}>
                    {personality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="greeting-message">Greeting Message</Label>
            <Textarea 
              id="greeting-message" 
              value={selectedPersonality.greetingMessage}
              rows={3}
              placeholder="Pesan sambutan untuk pengguna baru"
              readOnly
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="error-message">Error Message</Label>
            <Textarea 
              id="error-message" 
              value={selectedPersonality.errorMessage}
              rows={3}
              placeholder="Pesan ketika bot tidak memahami input pengguna"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="language-select">Bahasa</Label>
              <Select value={selectedPersonality.language.toLowerCase()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="tone-select">Tone</Label>
              <Select value={selectedPersonality.tone.toLowerCase()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="friendly">Ramah</SelectItem>
                  <SelectItem value="professional">Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline">
              Reset
            </Button>
            <Button>
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Personality Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Bot Personality</h2>
                <Button variant="ghost" size="sm" onClick={closeDialogs}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitAdd} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Personality Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Professional Customer Service, Friendly Sales Bot"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language *</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone *</Label>
                    <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting Message *</Label>
                  <Textarea
                    id="greeting"
                    placeholder="Welcome message for new users"
                    value={formData.greetingMessage}
                    onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="error">Error Message *</Label>
                  <Textarea
                    id="error"
                    placeholder="Message when bot doesn't understand user input"
                    value={formData.errorMessage}
                    onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fallback">Fallback Message</Label>
                  <Textarea
                    id="fallback"
                    placeholder="Message when escalating to human agent"
                    value={formData.fallbackMessage}
                    onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Set as Active</Label>
                    <p className="text-sm text-gray-600">Make this personality active immediately</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Personality Guidelines</p>
                      <p className="text-blue-700 mt-1">
                        Create consistent personality traits that match your brand voice. 
                        Consider your target audience and communication style.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Create Personality
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Personality Dialog */}
      {showEditDialog && editingPersonality && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Bot Personality</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Editing: <span className="font-medium">{editingPersonality.name}</span>
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Personality Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Professional Customer Service, Friendly Sales Bot"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-language">Language *</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tone">Tone *</Label>
                    <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-greeting">Greeting Message *</Label>
                  <Textarea
                    id="edit-greeting"
                    placeholder="Welcome message for new users"
                    value={formData.greetingMessage}
                    onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-error">Error Message *</Label>
                  <Textarea
                    id="edit-error"
                    placeholder="Message when bot doesn't understand user input"
                    value={formData.errorMessage}
                    onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fallback">Fallback Message</Label>
                  <Textarea
                    id="edit-fallback"
                    placeholder="Message when escalating to human agent"
                    value={formData.fallbackMessage}
                    onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Set as Active</Label>
                    <p className="text-sm text-gray-600">Make this personality active</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <p className="font-medium text-green-900">Personality Status</p>
                      <p className="text-green-700">
                        Created: {new Date(editingPersonality.created).toLocaleDateString('id-ID')} • 
                        Status: {editingPersonality.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update Personality
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingPersonality && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Personality</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to delete this bot personality?
                </p>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{deletingPersonality.name}</p>
                      <p className="text-sm text-gray-600">
                        {deletingPersonality.language} • {deletingPersonality.tone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-red-700 mt-1">
                      Deleting this personality will remove all associated messages and configurations. 
                      Any active chats using this personality will switch to the default personality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Personality
                </Button>
                <Button
                  variant="outline"
                  onClick={closeDialogs}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotPersonalitiesTab;
