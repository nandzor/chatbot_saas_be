import React from 'react';
import { Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Checkbox } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Generic FormField Component
 * Provides consistent form field rendering with validation and error handling
 */
export const FormField = ({
  // Field configuration
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,

  // Value and handlers
  value,
  onChange,
  onBlur,

  // Validation
  error,
  touched,

  // Options for select/multiselect
  options = [],

  // Additional props
  className = '',
  size = 'default',
  variant = 'default',

  // Field-specific props
  rows = 3,
  min,
  max,
  step,
  pattern,
  accept,
  multiple = false,

  // Custom renderer
  render,

  // Help text
  helpText,

  // Layout
  fullWidth = true,
  inline = false
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'h-8 text-sm',
      label: 'text-sm',
      help: 'text-xs'
    },
    default: {
      input: 'h-10 text-sm',
      label: 'text-sm',
      help: 'text-sm'
    },
    lg: {
      input: 'h-12 text-base',
      label: 'text-base',
      help: 'text-sm'
    }
  };

  const config = sizeConfig[size];

  // Handle change events
  const handleChange = (newValue) => {
    if (onChange) {
      onChange(name, newValue);
    }
  };

  // Handle blur events
  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
    }
  };

  // Render field based on type
  const renderField = () => {
    // Custom renderer takes precedence
    if (render) {
      return render({ value, onChange: handleChange, onBlur: handleBlur, error, touched });
    }

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <Select
            value={selectedValues.join(',')}
            onValueChange={(val) => handleChange(val ? val.split(',') : [])}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={handleChange}
              disabled={disabled}
              className={cn(
                error && touched && 'border-red-500',
                className
              )}
            />
            {label && (
              <Label className={cn(config.label, 'cursor-pointer')}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            {label && (
              <Label className={cn(config.label, 'cursor-pointer')}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            pattern={pattern}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'password':
        return (
          <Input
            type="password"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => handleChange(e.target.files)}
            onBlur={handleBlur}
            disabled={disabled}
            accept={accept}
            multiple={multiple}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'url':
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            pattern={pattern}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'tel':
        return (
          <Input
            type="tel"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            pattern={pattern}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            min={min}
            max={max}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'datetime-local':
        return (
          <Input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            min={min}
            max={max}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'color':
        return (
          <Input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'h-12 w-20',
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <Input
              type="range"
              value={value || min || 0}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              className={cn(
                'h-2',
                error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
              )}
            />
            <div className="text-sm text-gray-500 text-center">
              {value || min || 0}
            </div>
          </div>
        );

      case 'hidden':
        return (
          <Input
            type="hidden"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={className}
          />
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            pattern={pattern}
            className={cn(
              config.input,
              error && touched && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
          />
        );
    }
  };

  // Don't render label for checkbox/switch (handled inline)
  if (type === 'checkbox' || type === 'switch') {
    return (
      <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
        {renderField()}
        {error && touched && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        {helpText && !error && (
          <p className={cn('text-gray-500', config.help)}>{helpText}</p>
        )}
      </div>
    );
  }

  // Render with label
  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', inline && 'flex items-center space-x-4', className)}>
      {label && (
        <Label className={cn(config.label, 'font-medium', inline && 'min-w-[120px]')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className={cn(inline && 'flex-1')}>
        {renderField()}
        {error && touched && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        {helpText && !error && (
          <p className={cn('text-gray-500 mt-1', config.help)}>{helpText}</p>
        )}
      </div>
    </div>
  );
};

export default FormField;
