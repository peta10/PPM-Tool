import React, { useState } from 'react';
import { ComparisonSection } from '../components/ComparisonSection';
import { Header } from '../components/Header';
import { StepsSection } from '../components/StepsSection';
import { Tool, Criterion } from '../types';
import { useSteps } from '../contexts/StepContext';
import { useFullscreen } from '../contexts/FullscreenContext';
import { ArrowRight } from 'lucide-react';

interface ComparisonPageProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { setCurrentStep, markStepComplete } = useSteps();
  const { isMobile, toggleFullscreen } = useFullscreen();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle continue button click
  const handleContinue = React.useCallback(() => {
    setIsSubmitting(true);
    
    // Mark chart step as complete
    markStepComplete('chart');
    
    // Navigate to the next step using requestAnimationFrame for better DOM handling
    requestAnimationFrame(() => {
      if (isMobile) {
        toggleFullscreen('recommendations');
      } else {
        setCurrentStep('recommendations');
      }
      
      // Reduce timeout for faster navigation
      setTimeout(() => {
        setIsSubmitting(false);
      }, 100);
    });
  }, [markStepComplete, isMobile, toggleFullscreen, setCurrentStep]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'pb-20' : ''}`}>
      <Header />
      <StepsSection />
      
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
                Continue to Results
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <ComparisonSection
            selectedTools={selectedTools}
            selectedCriteria={selectedCriteria}
          />
        </div>
      </main>
    </div>
  );
}; 