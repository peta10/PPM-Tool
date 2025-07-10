import React, { createContext, useContext, useState } from 'react';

type FullscreenView = 'none' | 'criteria' | 'tools' | 'chart' | 'recommendations';

interface FullscreenContextType {
  fullscreenView: FullscreenView;
  setFullscreenView: (view: FullscreenView) => void;
  toggleFullscreen: (view: FullscreenView) => void;
  isMobile: boolean;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export function FullscreenProvider({ children }: { children: React.ReactNode }) {
  const [fullscreenView, setFullscreenView] = useState<FullscreenView>('none');
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    
    const handleMobileChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isMobileNow = e.matches;
      const wasDesktop = !isMobile;
      
      setIsMobile(isMobileNow);
      
      // When switching to mobile, set initial view if none selected
      if (isMobileNow && fullscreenView === 'none') {
        setFullscreenView('criteria');
      } 
      // When switching from mobile to desktop, exit fullscreen
      else if (!isMobileNow && wasDesktop === false) {
        setFullscreenView('none');
      }
    };
    
    // Set initial state
    handleMobileChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleMobileChange);
    return () => mediaQuery.removeEventListener('change', handleMobileChange);
  }, [fullscreenView, isMobile]);

  // Handle body class for fullscreen mode
  React.useEffect(() => {
    if (fullscreenView !== 'none') {
      document.body.classList.add('fullscreen-active');
    } else if (!isMobile) {
      document.body.classList.remove('fullscreen-active');
    }
  }, [fullscreenView, isMobile]);

  const toggleFullscreen = (view: FullscreenView) => {
    setFullscreenView(currentView => {
      return currentView === view && !isMobile ? 'none' : view;
    });
  };

  return (
    <FullscreenContext.Provider value={{ 
      fullscreenView, 
      setFullscreenView, 
      toggleFullscreen,
      isMobile
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