import React, { createContext, useContext, useState, useEffect } from 'react';

type Step = 'criteria' | 'tools' | 'chart' | 'recommendations' | 'results';

interface StepContextType {
  completedSteps: Set<Step>;
  currentStep: Step;
  canProceed: boolean;
  markStepComplete: (step: Step) => void;
  markStepIncomplete: (step: Step) => void;
  setCurrentStep: (step: Step) => void;
  validateStep: (step: Step) => boolean;
}

const StepContext = createContext<StepContextType | undefined>(undefined);

export const useSteps = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useSteps must be used within a StepProvider');
  }
  return context;
};

export const StepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [currentStep, setCurrentStep] = useState<Step>('criteria');
  const [canProceed, setCanProceed] = useState(false);

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 'criteria':
        // At least 3 criteria rated
        return true; // TODO: Implement actual validation
      case 'tools':
        // At least 2 tools selected
        return true; // TODO: Implement actual validation
      case 'chart':
        // Chart has been viewed
        return true; // TODO: Implement actual validation
      case 'recommendations':
        // Tools have been reviewed
        return true; // TODO: Implement actual validation
      case 'results':
        // Final results
        return true; // TODO: Implement actual validation
      default:
        return false;
    }
  };

  useEffect(() => {
    setCanProceed(validateStep(currentStep));
  }, [currentStep]);

  const markStepComplete = (step: Step) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(step);
      return newSet;
    });
  };

  const markStepIncomplete = (step: Step) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(step);
      return newSet;
    });
  };

  return (
    <StepContext.Provider
      value={{
        completedSteps,
        currentStep,
        canProceed,
        markStepComplete,
        markStepIncomplete,
        setCurrentStep,
        validateStep,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}; 