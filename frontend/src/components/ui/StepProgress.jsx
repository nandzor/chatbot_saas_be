import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

/**
 * Step Progress Component for multi-step forms
 */
export const StepProgress = ({
  steps = [],
  currentStep = 1,
  completedSteps = [],
  className = '',
  showLabels = true,
  showProgress = true,
  orientation = 'horizontal' // 'horizontal' or 'vertical'
}) => {
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber) || currentStep > stepNumber;
          const isUpcoming = currentStep < stepNumber;

          return (
            <div key={stepNumber} className="flex items-start space-x-3">
              {/* Step indicator */}
              <div className="flex-shrink-0">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                  {
                    'border-blue-600 bg-blue-600 text-white': isActive,
                    'border-green-500 bg-green-500 text-white': isCompleted,
                    'border-gray-300 bg-white text-gray-500': isUpcoming,
                  }
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                {showLabels && (
                  <>
                    <h4 className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      {
                        'text-blue-600': isActive,
                        'text-green-600': isCompleted,
                        'text-gray-500': isUpcoming,
                      }
                    )}>
                      {step.title || step.name || `Step ${stepNumber}`}
                    </h4>
                    {step.description && (
                      <p className={cn(
                        'text-xs mt-1 transition-colors duration-300',
                        {
                          'text-blue-500': isActive,
                          'text-green-500': isCompleted,
                          'text-gray-400': isUpcoming,
                        }
                      )}>
                        {step.description}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  'absolute left-4 top-8 w-0.5 h-8 transition-colors duration-300',
                  {
                    'bg-green-500': isCompleted,
                    'bg-gray-300': !isCompleted,
                  }
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation (default)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      {showProgress && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber) || currentStep > stepNumber;
          const isUpcoming = currentStep < stepNumber;

          return (
            <div key={stepNumber} className="flex flex-col items-center space-y-2">
              {/* Step circle */}
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                {
                  'border-blue-600 bg-blue-600 text-white': isActive,
                  'border-green-500 bg-green-500 text-white': isCompleted,
                  'border-gray-300 bg-white text-gray-500': isUpcoming,
                }
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>

              {/* Step label */}
              {showLabels && (
                <div className="text-center">
                  <h4 className={cn(
                    'text-xs font-medium transition-colors duration-300',
                    {
                      'text-blue-600': isActive,
                      'text-green-600': isCompleted,
                      'text-gray-500': isUpcoming,
                    }
                  )}>
                    {step.title || step.name || `Step ${stepNumber}`}
                  </h4>
                  {step.description && (
                    <p className={cn(
                      'text-xs mt-1 transition-colors duration-300',
                      {
                        'text-blue-500': isActive,
                        'text-green-500': isCompleted,
                        'text-gray-400': isUpcoming,
                      }
                    )}>
                      {step.description}
                    </p>
                  )}
                </div>
              )}

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  'absolute top-5 w-16 h-0.5 transition-colors duration-300',
                  {
                    'bg-green-500': isCompleted,
                    'bg-gray-300': !isCompleted,
                  }
                )} style={{ left: 'calc(50% + 20px)', transform: 'translateX(-50%)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress percentage */}
      {showProgress && (
        <div className="text-center">
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Form Field Progress Component
 * Shows progress for individual form fields
 */
export const FieldProgress = ({
  fields = [],
  values = {},
  validationRules = {},
  className = ''
}) => {
  const totalFields = fields.length;
  const completedFields = fields.filter(field => {
    const value = values[field.name];
    if (!value || value.toString().trim() === '') return false;

    // Check validation rules
    if (validationRules[field.name]?.required && !value) return false;
    if (validationRules[field.name]?.minLength && value.length < validationRules[field.name].minLength) return false;

    return true;
  }).length;

  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Form Progress</span>
        <span className="font-medium text-gray-900">
          {completedFields} / {totalFields} fields
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center">
        <span className="text-xs text-gray-500">
          {Math.round(progress)}% Complete
        </span>
      </div>
    </div>
  );
};

export default StepProgress;
