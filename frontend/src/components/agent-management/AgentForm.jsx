import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  SelectValue,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui';
import { X, Plus } from 'lucide-react';

const AgentForm = ({ agent, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    display_name: '',
    phone: '',
    department: '',
    specialization: '',
    max_concurrent_chats: 5,
    skills: [],
    status: 'active',
    availability_status: 'offline',
  });

  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});

  // Initialize form data when agent prop changes
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.user?.name || '',
        email: agent.user?.email || '',
        password: '',
        display_name: agent.display_name || '',
        phone: agent.phone || '',
        department: agent.department || '',
        specialization: agent.specialization || '',
        max_concurrent_chats: agent.max_concurrent_chats || 5,
        skills: agent.skills || [],
        status: agent.status || 'active',
        availability_status: agent.availability_status || 'offline',
      });
    }
  }, [agent]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle skill addition
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Handle skill removal
  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!agent && !formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.display_name.trim()) newErrors.display_name = 'Display name is required';
    if (formData.max_concurrent_chats < 1) newErrors.max_concurrent_chats = 'Max concurrent chats must be at least 1';
    if (formData.max_concurrent_chats > 50) newErrors.max_concurrent_chats = 'Max concurrent chats cannot exceed 50';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only for new agents)
    if (!agent && formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Remove password from data if it's empty (for updates)
      const submitData = { ...formData };
      if (agent && !submitData.password) {
        delete submitData.password;
      }

      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the agent's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Enter display name"
                className={errors.display_name ? 'border-red-500' : ''}
              />
              {errors.display_name && (
                <p className="text-sm text-red-500">{errors.display_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {!agent && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Set up the agent's professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Enter specialization"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_concurrent_chats">Max Concurrent Chats</Label>
            <Input
              id="max_concurrent_chats"
              type="number"
              min="1"
              max="50"
              value={formData.max_concurrent_chats}
              onChange={(e) => handleInputChange('max_concurrent_chats', parseInt(e.target.value) || 1)}
              className={errors.max_concurrent_chats ? 'border-red-500' : ''}
            />
            {errors.max_concurrent_chats && (
              <p className="text-sm text-red-500">{errors.max_concurrent_chats}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Maximum number of concurrent chat sessions this agent can handle
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Add skills and expertise areas for this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter a skill"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <Button type="button" onClick={handleAddSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status and Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Availability</CardTitle>
          <CardDescription>
            Set the agent's current status and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectValue placeholder="Select status" />
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability_status">Availability</Label>
              <Select value={formData.availability_status} onValueChange={(value) => handleInputChange('availability_status', value)}>
                <SelectValue placeholder="Select availability" />
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {agent ? 'Update Agent' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );
};

export default AgentForm;
