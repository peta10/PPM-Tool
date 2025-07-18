import React from 'react';
import { WelcomeScreen } from '@/components/common/WelcomeScreen';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLenis } from '@/shared/hooks/useLenis';

export function App() {
  const { isMobile } = useFullscreen();
  useAuth(); // Initialize auth state

  // Initialize Lenis smooth scrolling - allow it to work normally
  useLenis({
    disabled: false, // Always allow scrolling
    lerp: isMobile ? 0.15 : 0.1,
    duration: isMobile ? 1 : 1.2,
    isMobile
  });

  const handleWelcomeGetStarted = () => {
    localStorage.setItem('ppm-tool-finder-welcome-seen', 'true');
  };

  const handleWelcomeSkip = () => {
    localStorage.setItem('ppm-tool-finder-welcome-seen', 'true');
  };

  // Always show welcome screen with embedded tool
  return (
    <WelcomeScreen 
      onGetStarted={handleWelcomeGetStarted}
      onSkip={handleWelcomeSkip}
    />
  );

  // Always show welcome screen with embedded tool
  return (
    <WelcomeScreen 
      onGetStarted={handleWelcomeGetStarted}
      onSkip={handleWelcomeSkip}
    />
  );
}
