import React from 'react';
import { useFullscreen } from '../contexts/FullscreenContext';
import { Sliders, Layout, LineChart, Award } from 'lucide-react';

export const StepsSection: React.FC = () => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();

  const steps = [
    { id: 'criteria', label: 'Rank your Criteria', icon: Sliders },
    { id: 'tools', label: 'Select Tools', icon: Layout },
    { id: 'chart', label: 'Analyze Chart', icon: LineChart },
    { id: 'recommendations', label: 'Review Recommendations', icon: Award },
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isActive = fullscreenView === step.id;
            const isClickable = !isMobile || fullscreenView !== step.id;
            
            return (
              <React.Fragment key={step.id}>
                {index > 0 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
                <button
                  onClick={() => isClickable && toggleFullscreen(step.id as any)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center text-center transition-colors ${
                    isActive
                      ? 'text-midnight-800' 
                      : `text-midnight-400 ${isClickable ? 'hover:text-midnight-600' : 'cursor-default'}`
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${
                    isActive
                      ? 'bg-alpine-blue-500' 
                      : 'bg-midnight-300 group-hover:bg-midnight-400'
                  } text-white flex items-center justify-center text-sm font-medium mb-1`}>
                    {index + 1}
                  </div>
                  <span className="text-xs font-medium leading-tight">{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};