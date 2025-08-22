import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Switch,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  Save,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  MessageSquare,
  Zap,
  Star,
  Crown,
  Settings
} from 'lucide-react';

const PlanModal = ({ plan, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    tier: 'basic',
    priceMonthly: 0,
    priceYearly: 0,
    maxAgents: 1,
    maxMessagesPerMonth: 100,
    features: [],
    isActive: true,
    description: '',
    highlights: [],
    isPopular: false,
    sortOrder: 0
  });

  const [featureInput, setFeatureInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        tier: plan.tier || 'basic',
        priceMonthly: plan.priceMonthly || 0,
        priceYearly: plan.priceYearly || 0,
        maxAgents: plan.maxAgents || 1,
        maxMessagesPerMonth: plan.maxMessagesPerMonth || 100,
        features: plan.features || [],
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        description: plan.description || '',
        highlights: plan.highlights || [],
        isPopular: plan.highlights?.includes('Terpopuler') || false,
        sortOrder: plan.sortOrder || 0
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        tier: 'basic',
        priceMonthly: 0,
        priceYearly: 0,
        maxAgents: 1,
        maxMessagesPerMonth: 100,
        features: [],
        isActive: true,
        description: '',
        highlights: [],
        isPopular: false,
        sortOrder: 0
      });
    }
    setErrors({});
  }, [plan]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama paket wajib diisi';
    }

    if (formData.priceMonthly < 0) {
      newErrors.priceMonthly = 'Harga harus positif';
    }

    if (formData.maxAgents < 1) {
      newErrors.maxAgents = 'Minimal harus ada 1 agent';
    }

    if (formData.maxMessagesPerMonth < 1) {
      newErrors.maxMessagesPerMonth = 'Minimal harus ada 1 pesan per bulan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate yearly price if not set
      const finalData = {
        ...formData,
        priceYearly: formData.priceYearly || Math.round(formData.priceMonthly * 10), // 10 bulan bayar untuk 12 bulan
        highlights: formData.highlights || []
      };

      // Add popular highlight if isPopular is true
      if (formData.isPopular && !finalData.highlights.includes('Terpopuler')) {
        finalData.highlights.push('Terpopuler');
      } else if (!formData.isPopular) {
        finalData.highlights = finalData.highlights.filter(h => h !== 'Terpopuler');
      }

      await onSave(finalData);
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addHighlight = () => {
    if (highlightInput.trim() && !formData.highlights.includes(highlightInput.trim())) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()]
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const getTierColor = (tier) => {
    const colors = {
      basic: 'bg-green-100 text-green-800 border-green-200',
      professional: 'bg-blue-100 text-blue-800 border-blue-200',
      enterprise: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[tier] || colors.basic;
  };

  const getTierIcon = (tier) => {
    const icons = {
      basic: <Users className="w-4 h-4" />,
      professional: <Zap className="w-4 h-4" />,
      enterprise: <Crown className="w-4 h-4" />
    };
    return icons[tier] || icons.basic;
  };

  const getTierDescription = (tier) => {
    const descriptions = {
      basic: 'Untuk UMKM dan startup',
      professional: 'Untuk bisnis yang berkembang',
      enterprise: 'Solusi enterprise lengkap'
    };
    return descriptions[tier] || descriptions.basic;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-8 py-6 border-b">
          <div className="flex items-center gap-3">
            {getTierIcon(formData.tier)}
            <div>
              <DialogTitle className="text-2xl font-bold">
                {plan ? 'Edit Paket Berlangganan' : 'Buat Paket Baru'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {plan 
                  ? 'Perbarui detail dan fitur paket berlangganan'
                  : 'Buat paket berlangganan baru untuk pelanggan Anda'
                }
              </DialogDescription>
            </div>
          </div>
          <DialogClose onClick={onClose} className="absolute right-6 top-6" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-blue-600">
              <DollarSign className="w-6 h-6" />
              Informasi Dasar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Paket *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Starter, Business, Enterprise"
                  className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="tier" className="text-sm font-medium">
                  Tier Paket
                </Label>
                <Select value={formData.tier} onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getTierColor(formData.tier)} text-sm font-medium`}>
                    {formData.tier.charAt(0).toUpperCase() + formData.tier.slice(1)} Tier
                  </Badge>
                  <span className="text-xs text-gray-500">{getTierDescription(formData.tier)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi Paket
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Jelaskan apa yang ditawarkan paket ini, manfaat, dan target pengguna..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-green-600">
              <DollarSign className="w-6 h-6" />
              Harga & Billing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="priceMonthly" className="text-sm font-medium">
                  Harga Bulanan (Rp) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <Input
                    id="priceMonthly"
                    type="number"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className={`pl-12 ${errors.priceMonthly ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.priceMonthly && <p className="text-sm text-red-600">{errors.priceMonthly}</p>}
                <p className="text-xs text-gray-500">
                  Harga per bulan untuk pelanggan
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="priceYearly" className="text-sm font-medium">
                  Harga Tahunan (Rp)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <Input
                    id="priceYearly"
                    type="number"
                    value={formData.priceYearly}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: parseInt(e.target.value) || 0 }))}
                    placeholder="Auto-calculated (20% discount)"
                    className="pl-12"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Kosongkan untuk kalkulasi otomatis (10 bulan bayar untuk 12 bulan)
                </p>
              </div>
            </div>

            {/* Popular Plan Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <Switch
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
              />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <Label htmlFor="isPopular" className="text-sm font-medium text-yellow-800">
                  Tandai sebagai Paket Terpopuler
                </Label>
              </div>
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                ⭐ Terpopuler
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Limits */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-purple-600">
              <Users className="w-6 h-6" />
              Batasan Penggunaan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="maxAgents" className="text-sm font-medium">
                  Maksimal Agent *
                </Label>
                <Input
                  id="maxAgents"
                  type="number"
                  value={formData.maxAgents}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAgents: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                  className={errors.maxAgents ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.maxAgents && <p className="text-sm text-red-600">{errors.maxAgents}</p>}
                <p className="text-xs text-gray-500">
                  Jumlah agent yang dapat diaktifkan
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="maxMessagesPerMonth" className="text-sm font-medium">
                  Maksimal Pesan per Bulan *
                </Label>
                <Input
                  id="maxMessagesPerMonth"
                  type="number"
                  value={formData.maxMessagesPerMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMessagesPerMonth: parseInt(e.target.value) || 100 }))}
                  placeholder="100"
                  className={errors.maxMessagesPerMonth ? 'border-red-500 focus:border-red-500' : ''}
                />
                {errors.maxMessagesPerMonth && <p className="text-sm text-red-600">{errors.maxMessagesPerMonth}</p>}
                <p className="text-xs text-gray-500">
                  Batas pesan yang dapat dikirim per bulan
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-indigo-600">
              <Zap className="w-6 h-6" />
              Fitur & Kemampuan
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Tambahkan fitur baru..."
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1"
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm flex-1">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700 p-1 h-6 w-6 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Highlights */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-amber-600">
              <Star className="w-6 h-6" />
              Highlight & Promosi
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Tambahkan highlight baru..."
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  className="flex-1"
                />
                <Button type="button" onClick={addHighlight} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.highlights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <Star className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm flex-1">{highlight}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHighlight(index)}
                        className="text-red-600 hover:text-red-700 p-1 h-6 w-6 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-gray-600">
              <Settings className="w-6 h-6" />
              Status & Konfigurasi
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="text-base font-medium">
                  Paket Aktif
                </Label>
                <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                  {formData.isActive ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>
              
              {!formData.isActive && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Paket ini akan disembunyikan dari pelanggan ketika tidak aktif.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="sortOrder" className="text-sm font-medium">
                  Urutan Tampilan
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-32"
                />
                <p className="text-xs text-gray-500">
                  Angka lebih kecil akan ditampilkan lebih dulu
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 border-t">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : (plan ? 'Update Paket' : 'Buat Paket')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanModal;
