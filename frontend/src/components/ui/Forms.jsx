import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  EyeOff,
  Search,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Save,
  Cancel,
  Trash2,
  RotateCcw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

/**
 * Form field component
 */
export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const renderInput = () => {
    switch (type) {
      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md resize-none ${error ? 'border-red-500' : ''}`}
            rows={4}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : ''}`}
          >
            <option value="">Select {label}</option>
            {/* Options will be passed as children */}
          </select>
        );
      default:
        return (
          <Input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};

/**
 * Form section component
 */
export const FormSection = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
};

/**
 * Form actions component
 */
export const FormActions = ({
  onSave,
  onCancel,
  onReset,
  loading = false,
  disabled = false,
  saveText = 'Save',
  cancelText = 'Cancel',
  resetText = 'Reset',
  showReset = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-end space-x-2 ${className}`}>
      {showReset && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={loading || disabled}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {resetText}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading || disabled}
      >
        <Cancel className="w-4 h-4 mr-2" />
        {cancelText}
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={loading || disabled}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {saveText}
      </Button>
    </div>
  );
};

/**
 * Form validation component
 */
export const FormValidation = ({
  errors = {},
  className = ''
}) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(errors).map(([field, error]) => (
        <div key={field} className="flex items-center space-x-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Form progress component
 */
export const FormProgress = ({
  currentStep,
  totalSteps,
  className = ''
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Form steps component
 */
export const FormSteps = ({
  steps = [],
  currentStep,
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isClickable = onStepClick && (isCompleted || isActive);

        return (
          <div
            key={index}
            className={`flex items-center space-x-2 ${
              isClickable ? 'cursor-pointer' : ''
            }`}
            onClick={() => isClickable && onStepClick(stepNumber)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                stepNumber
              )}
            </div>
            <span
              className={`text-sm ${
                isActive ? 'font-medium text-primary' : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Form field group component
 */
export const FormFieldGroup = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

/**
 * Form field array component
 */
export const FormFieldArray = ({
  fields = [],
  onAdd,
  onRemove,
  onMove,
  addText = 'Add Item',
  removeText = 'Remove',
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {fields.map((field, index) => (
        <div key={field.id || index} className="flex items-end space-x-2">
          <div className="flex-1">
            {field}
          </div>
          <div className="flex items-center space-x-1">
            {onMove && index > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onMove(index, index - 1)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
            {onMove && index < fields.length - 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onMove(index, index + 1)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {onAdd && (
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {addText}
        </Button>
      )}
    </div>
  );
};

/**
 * Form search component
 */
export const FormSearch = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        {loading && (
          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {value && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Form toggle component
 */
export const FormToggle = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        id={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="rounded"
      />
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
    </div>
  );
};

/**
 * Form radio group component
 */
export const FormRadioGroup = ({
  name,
  options = [],
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded"
          />
          <Label htmlFor={`${name}-${option.value}`} className="text-sm">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
};

/**
 * Form checkbox group component
 */
export const FormCheckboxGroup = ({
  name,
  options = [],
  value = [],
  onChange,
  className = ''
}) => {
  const handleChange = (optionValue, checked) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${name}-${option.value}`}
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            className="rounded"
          />
          <Label htmlFor={`${name}-${option.value}`} className="text-sm">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default {
  FormField,
  FormSection,
  FormActions,
  FormValidation,
  FormProgress,
  FormSteps,
  FormFieldGroup,
  FormFieldArray,
  FormSearch,
  FormToggle,
  FormRadioGroup,
  FormCheckboxGroup
};
