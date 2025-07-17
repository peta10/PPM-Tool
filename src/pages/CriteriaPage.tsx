import React, { useState, useEffect } from 'react';
import { CriteriaSection } from '@/features/criteria/components/CriteriaSection';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
import { CTABanner } from '@/components/common/CTABanner';
import { Criterion } from '@/shared/types';
import { useSteps } from '@/shared/contexts/StepContext';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CriteriaPageProps {
  criteria: Criterion[];
  removedCriteria: Criterion[];
  onRemovedCriteriaChange: (criteria: Criterion[]) => void;
  onCriteriaChange: (criteria: Criterion[]) => void;
  onRemoveCriterion: (criterion: Criterion) => void;
  onRestoreCriterion: (criterion: Criterion) => void;
  onRestoreAll: () => void;
  startWithGuidedQuestions?: boolean;
}

export const CriteriaPage: React.FC<CriteriaPageProps> = ({
  criteria,
  removedCriteria,
  onRemovedCriteriaChange,
  onCriteriaChange,
  onRemoveCriterion,
  onRestoreCriterion,
  onRestoreAll,
  startWithGuidedQuestions = false,
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

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const validationErrorVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'pb-20' : ''}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Only show header and steps section if not in mobile fullscreen mode */}
      {(!isMobile || !toggleFullscreen) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Header />
          <CTABanner />
          <StepsSection />
        </motion.div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {validationError && (
            <motion.div
              key="validation-error"
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 shadow-sm"
              variants={validationErrorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center">
                <motion.div
                  className="w-2 h-2 bg-red-400 rounded-full mr-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                {validationError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
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
            startWithGuidedQuestions={startWithGuidedQuestions}
          />
        </motion.div>
      </main>
    </motion.div>
  );
}; 