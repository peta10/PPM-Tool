import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';

const VIEWS = ['criteria', 'tools', 'chart', 'recommendations', 'results'] as const;
type ViewType = typeof VIEWS[number];

const getNextView = (currentView: string): ViewType => {
  const currentIndex = VIEWS.indexOf(currentView as ViewType);
  return VIEWS[(currentIndex + 1) % VIEWS.length];
};

const getPreviousView = (currentView: string): ViewType => {
  const currentIndex = VIEWS.indexOf(currentView as ViewType);
  return VIEWS[(currentIndex - 1 + VIEWS.length) % VIEWS.length];
};

export const FullscreenNavigation: React.FC = () => {
  const { fullscreenView, setFullscreenView, isMobile, isTransitioning } = useFullscreen();

  const handleNext = React.useCallback(() => {
    if (isTransitioning) return;
    
    const nextView = getNextView(fullscreenView);
    if (nextView) {
      setFullscreenView(nextView);
    }
  }, [fullscreenView, setFullscreenView, isTransitioning]);

  const handlePrevious = React.useCallback(() => {
    if (isTransitioning) return;
    
    const prevView = getPreviousView(fullscreenView);
    if (prevView) {
      setFullscreenView(prevView);
    }
  }, [fullscreenView, setFullscreenView, isTransitioning]);

  if (fullscreenView === 'none') return null;

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