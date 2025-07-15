import React from 'react';
import { Tool, Criterion } from '../types';
import { ComparisonChart } from './ComparisonChart';
import { useFullscreen } from '../contexts/FullscreenContext';
import { EnhancedRecommendationSection } from './EnhancedRecommendationSection';
import { useSteps } from '../contexts/StepContext';

interface ComparisonSectionProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { fullscreenView, isMobile } = useFullscreen();
  const { currentStep } = useSteps();

  // For mobile, check the fullscreen view. For desktop, show chart always but recommendations only on the last page
  const shouldShowRecommendations = isMobile 
    ? fullscreenView === 'recommendations' 
    : currentStep === 'recommendations';
    
  const shouldShowChart = isMobile ? fullscreenView === 'chart' : true;

  if (shouldShowRecommendations && isMobile) {
    return (
      <EnhancedRecommendationSection
        selectedTools={selectedTools}
        selectedCriteria={selectedCriteria}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart Section */}
      {shouldShowChart && (
        <ComparisonChart
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
        />
      )}

      {/* Enhanced Recommendations Section for Desktop - only on recommendations step */}
      {shouldShowRecommendations && !isMobile && (
        <EnhancedRecommendationSection
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
        />
      )}
    </div>
  );
};