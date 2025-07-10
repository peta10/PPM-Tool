import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFullscreen } from '../contexts/FullscreenContext';

const VIEWS = ['criteria', 'tools', 'chart', 'recommendations'] as const;

const getNextView = (currentView: string) => {
  const currentIndex = VIEWS.indexOf(currentView as any);
  return VIEWS[(currentIndex + 1) % VIEWS.length];
};

const getPreviousView = (currentView: string) => {
  const currentIndex = VIEWS.indexOf(currentView as any);
  return VIEWS[(currentIndex - 1 + VIEWS.length) % VIEWS.length];
};

export const FullscreenNavigation: React.FC = () => {
  const { fullscreenView, setFullscreenView, isMobile } = useFullscreen();

  if (fullscreenView === 'none') return null;

  const handleNext = () => {
    setFullscreenView(getNextView(fullscreenView) as any);
  };

  const handlePrevious = () => {
    setFullscreenView(getPreviousView(fullscreenView) as any);
  };

  return (
    <div className={`flex items-center space-x-1 ${isMobile ? 'mobile-nav' : ''}`}>
      <button
        onClick={handlePrevious}
        className="p-2 hover:bg-gray-100 rounded-lg group"
        aria-label="Previous section"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>
      
      <button
        onClick={handleNext}
        className="p-2 hover:bg-gray-100 rounded-lg group"
        aria-label="Next section"
      >
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>
    </div>
  );
};