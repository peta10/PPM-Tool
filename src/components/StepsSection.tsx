import React from 'react';
import { useFullscreen } from '../contexts/FullscreenContext';
import { Sliders, Layout, LineChart, Award, ChevronRight } from 'lucide-react';

export const StepsSection: React.FC = () => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();

  const steps = [
    { id: 'criteria', label: 'Rank your Criteria', icon: Sliders, description: 'Set importance levels' },
    { id: 'tools', label: 'Select Tools', icon: Layout, description: 'Choose PPM solutions' },
    { id: 'chart', label: 'Analyze Chart', icon: LineChart, description: 'Visual comparison' },
    { id: 'recommendations', label: 'Analyze Results', icon: Award, description: 'Get recommendations' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === fullscreenView);

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
                const isActive = fullscreenView === step.id;
                const isCompleted = currentStepIndex > index;
                const isClickable = !isMobile || fullscreenView !== step.id;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => isClickable && toggleFullscreen(step.id as 'criteria' | 'tools' | 'chart' | 'recommendations')}
                      disabled={!isClickable}
                      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                          : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-white/20'
                          : isCompleted
                          ? 'bg-green-200'
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}>
                        {React.createElement(step.icon, {
                          className: `w-4 h-4 ${
                            isActive ? 'text-white' : isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`
                        })}
                      </div>
                      <div className="hidden sm:block">
                        <div className={`text-sm font-medium transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-900'
                        }`}>
                          {step.label}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </div>
                      </div>
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
              <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};