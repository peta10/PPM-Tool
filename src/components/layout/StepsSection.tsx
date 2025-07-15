import React from 'react';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { useSteps } from '@/shared/contexts/StepContext';
import { Sliders, Layout, LineChart, Award, ChevronRight, Lock, Trophy } from 'lucide-react';

export const StepsSection: React.FC = () => {
  const { toggleFullscreen, isMobile } = useFullscreen();
  const { completedSteps, currentStep } = useSteps();

  const steps = [
    { id: 'criteria', label: 'Rank your Criteria', icon: Sliders, description: 'Set importance levels' },
    { id: 'tools', label: 'Select Tools', icon: Layout, description: 'Choose PPM solutions' },
    { id: 'chart', label: 'Analyze Chart', icon: LineChart, description: 'Visual comparison' },
    { id: 'recommendations', label: 'Review Tools', icon: Award, description: 'Tool recommendations' },
    { id: 'results', label: 'Final Results', icon: Trophy, description: 'Download report' },
  ] as const;

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const canAccessStep = (stepId: typeof steps[number]['id']) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const prevSteps = steps.slice(0, stepIndex).map(step => step.id);
    return prevSteps.every(step => completedSteps.has(step));
  };

  const handleStepClick = (stepId: typeof steps[number]['id']) => {
    if (canAccessStep(stepId)) {
      toggleFullscreen(stepId);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {isMobile ? (
          // Mobile: Current step indicator
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStepIndex >= 0 && (
                <>
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    {React.createElement(steps[currentStepIndex].icon, {
                      className: "w-5 h-5 text-white"
                    })}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{steps[currentStepIndex].label}</div>
                    <div className="text-sm text-gray-500">{steps[currentStepIndex].description}</div>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm font-medium text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
        ) : (
          // Desktop: Full step navigation
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.has(step.id);
                const isAccessible = canAccessStep(step.id);
                const isClickable = isAccessible && !isMobile;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => isClickable && handleStepClick(step.id)}
                      disabled={!isClickable}
                      className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                          : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : isAccessible
                          ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } ${isClickable ? 'cursor-pointer hover:scale-105' : ''}`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-white/20'
                          : isCompleted
                          ? 'bg-green-200'
                          : isAccessible
                          ? 'bg-gray-200 group-hover:bg-gray-300'
                          : 'bg-gray-200'
                      }`}>
                        {!isAccessible ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : (
                          React.createElement(step.icon, {
                            className: `w-4 h-4 ${
                              isActive ? 'text-white' : isCompleted ? 'text-green-600' : 'text-gray-500'
                            }`
                          })
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <div className={`text-sm font-medium transition-colors duration-300 ${
                          isActive ? 'text-white' : isAccessible ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isActive ? 'text-blue-100' : isAccessible ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </div>
                      </div>
                      
                      {!isAccessible && (
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                            Complete previous steps first
                          </div>
                        </div>
                      )}
                    </button>
                    
                    {index < steps.length - 1 && (
                      <ChevronRight className={`w-4 h-4 transition-colors duration-300 ${
                        isCompleted ? 'text-green-400' : 'text-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress bar for mobile */}
        {isMobile && currentStepIndex >= 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(((completedSteps.size) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};