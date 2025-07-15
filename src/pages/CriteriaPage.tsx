import React, { useState, useEffect } from 'react';
import { CriteriaSection } from '../components/CriteriaSection';
import { Header } from '../components/Header';
import { StepsSection } from '../components/StepsSection';
import { Criterion } from '../types';
import { useSteps } from '../contexts/StepContext';
import { useFullscreen } from '../contexts/FullscreenContext';
import { ArrowRight } from 'lucide-react';

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
      
      {/* Top Continue Button */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className={`
              flex items-center px-6 py-2 
              bg-alpine-blue-500 hover:bg-alpine-blue-600 text-white font-medium 
              rounded-lg transition-colors shadow-sm text-sm
              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Processing</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                Continue to Tool Selection
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
      
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
        />
      </main>
    </div>
  );
}; 