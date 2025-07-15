import React, { useState, useEffect } from 'react';
import { EnhancedRecommendationSection } from '@/features/recommendations/components/EnhancedRecommendationSection';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
import { Tool, Criterion } from '@/shared/types';
import { useSteps } from '@/shared/contexts/StepContext';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';

interface RecommendationsPageProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { setCurrentStep, markStepComplete } = useSteps();
  const { isMobile, toggleFullscreen } = useFullscreen();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate tools before proceeding to results
  const validateTools = (): boolean => {
    // Check if at least 1 tool is selected for final analysis
    if (selectedTools.length < 1) {
      setValidationError("Please select at least 1 tool to analyze in the results");
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  // Handle continue button click
  const handleContinue = React.useCallback(() => {
    if (!validateTools()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Mark recommendations step as complete
    markStepComplete('recommendations');
    
    // Navigate to the results step using requestAnimationFrame for better DOM handling
    requestAnimationFrame(() => {
      if (isMobile) {
        toggleFullscreen('results');
      } else {
        setCurrentStep('results');
      }
      
      // Reduce timeout for faster navigation
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    });
  }, [validateTools, markStepComplete, isMobile, toggleFullscreen, setCurrentStep]);

  // Clear validation error when tools change
  useEffect(() => {
    if (validationError) {
      setValidationError(null);
    }
  }, [selectedTools]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'pb-20' : ''}`}>
      <Header />
      <StepsSection />
      
      <main className="container mx-auto px-4 py-8">
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {validationError}
          </div>
        )}
        
        <EnhancedRecommendationSection
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
          onContinue={handleContinue}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}; 