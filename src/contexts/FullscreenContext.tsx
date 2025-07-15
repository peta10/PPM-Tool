import React, { createContext, useContext, useState } from 'react';

type FullscreenView = 'none' | 'criteria' | 'tools' | 'chart' | 'recommendations' | 'results';

interface FullscreenContextType {
  fullscreenView: FullscreenView;
  setFullscreenView: (view: FullscreenView) => void;
  toggleFullscreen: (view: FullscreenView) => void;
  isMobile: boolean;
  isTransitioning: boolean;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
  const [fullscreenView, setFullscreenView] = useState<FullscreenView>('none');
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    
    const handleMobileChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isMobileNow = e.matches;
      setIsMobile(isMobileNow);
      
      // Only set initial view on mobile if no view is selected
      if (isMobileNow && fullscreenView === 'none') {
        setFullscreenView('criteria');
      }
    };
    
    // Set initial state
    handleMobileChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleMobileChange);
    return () => mediaQuery.removeEventListener('change', handleMobileChange);
  }, [fullscreenView]);

  // Handle body class for fullscreen mode
  React.useEffect(() => {
    if (fullscreenView !== 'none') {
      document.body.classList.add('fullscreen-active');
    } else {
      document.body.classList.remove('fullscreen-active');
    }
  }, [fullscreenView]);

  const toggleFullscreen = (view: FullscreenView) => {
    // Prevent rapid transitions that could cause DOM issues
    if (isTransitioning) {
      return;
    }
    
    setIsTransitioning(true);
    
    // Use requestAnimationFrame to ensure DOM updates complete
    requestAnimationFrame(() => {
      setFullscreenView(currentView => {
        // On mobile, always allow view changes
        if (isMobile) {
          return view;
        }
        // On desktop, toggle between view and none
        return currentView === view ? 'none' : view;
      });
      
      // Reset transition flag after a brief delay
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    });
  };

  return (
    <FullscreenContext.Provider value={{ 
      fullscreenView, 
      setFullscreenView, 
      toggleFullscreen,
      isMobile,
      isTransitioning
    }}>
      {children}
    </FullscreenContext.Provider>
  );
}

export function useFullscreen() {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
}