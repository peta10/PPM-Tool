import React, { useState, useEffect } from 'react';
import { CriteriaSection } from '@/features/criteria/components/CriteriaSection';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
import { Criterion } from '@/shared/types';
import { useSteps } from '@/shared/contexts/StepContext';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';

interface CriteriaPageProps {
  criteria: Criterion[];
  removedCriteria: Criterion[];
  onRemovedCriteriaChange: (criteria: Criterion[]) => void;
  onCriteriaChange: (criteria: Criterion[]) => void;
  onRemoveCriterion: (criterion: Criterion) => void;
  onRestoreCriterion: (criterion: Criterion) => void;
  onRestoreAll: () => void;
}

export const CriteriaPage: React.FC<CriteriaPageProps> = ({
  criteria,
  removedCriteria,
  onRemovedCriteriaChange,
  onCriteriaChange,
  onRemoveCriterion,
  onRestoreCriterion,
  onRestoreAll,
}) => {
  const { setCurrentStep, markStepComplete } = useSteps();
  const { isMobile, toggleFullscreen } = useFullscreen();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate criteria before proceeding
  const validateCriteria = (): boolean => {
    // Check if we have at least 3 criteria
    if (criteria.length < 3) {
      setValidationError("You need at least 3 criteria to continue");
      return false;
    }
    
    // Check if all criteria have been rated
    const unratedCriteria = criteria.filter(c => !c.userRating || c.userRating <= 0);
    if (unratedCriteria.length > 0) {
      setValidationError("Please rate all criteria before continuing");
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  // Handle continue button click
  const handleContinue = React.useCallback(() => {
    if (!validateCriteria()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Mark criteria step as complete
    markStepComplete('criteria');
    
    // Navigate to the next step using requestAnimationFrame for better DOM handling
    requestAnimationFrame(() => {
      if (isMobile) {
        toggleFullscreen('tools');
      } else {
        setCurrentStep('tools');
      }
      
      // Reduce timeout for faster navigation
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    });
  }, [validateCriteria, markStepComplete, isMobile, toggleFullscreen, setCurrentStep]);

  // Clear validation error when criteria change
  useEffect(() => {
    if (validationError) {
      setValidationError(null);
    }
  }, [criteria]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'pb-20' : ''}`}>
      {/* Only show header and steps section if not in mobile fullscreen mode */}
      {(!isMobile || !toggleFullscreen) && (
        <>
          <Header />
          <StepsSection />
        </>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {validationError}
          </div>
        )}
        
        <CriteriaSection
          criteria={criteria}
          removedCriteria={removedCriteria}
          onRemovedCriteriaChange={onRemovedCriteriaChange}
          onCriteriaChange={onCriteriaChange}
          onRemoveCriterion={onRemoveCriterion}
          onRestoreCriterion={onRestoreCriterion}
          onRestoreAll={onRestoreAll}
          onContinue={handleContinue}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}; 