import React, { useState, useEffect } from 'react';
import { ToolSection } from '@/features/tools/ToolSection';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
import { Tool, Criterion } from '@/shared/types';
import { FilterCondition } from '@/components/filters/FilterSystem';
import { useSteps } from '@/shared/contexts/StepContext';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';

interface ToolsPageProps {
  tools: Tool[];
  selectedTools: Tool[];
  removedTools: Tool[];
  selectedCriteria: Criterion[];
  filterConditions: FilterCondition[];
  filterMode: 'AND' | 'OR';
  onAddFilterCondition: () => void;
  onRemoveFilterCondition: (id: string) => void;
  onUpdateFilterCondition: (id: string, updates: Partial<FilterCondition>) => void;
  onToggleFilterMode: () => void;
  onToolSelect: (tool: Tool) => void;
  onToolRemove: (toolId: string) => void;
  onToolsReorder: (tools: Tool[]) => void;
  onRestoreAll: () => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({
  tools,
  selectedTools,
  removedTools,
  selectedCriteria,
  filterConditions,
  filterMode,
  onAddFilterCondition,
  onRemoveFilterCondition,
  onUpdateFilterCondition,
  onToggleFilterMode,
  onToolSelect,
  onToolRemove,
  onToolsReorder,
  onRestoreAll,
}) => {
  const { setCurrentStep, markStepComplete } = useSteps();
  const { isMobile, toggleFullscreen } = useFullscreen();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate tools before proceeding
  const validateTools = (): boolean => {
    // Check if at least 1 tool is selected for comparison
    if (selectedTools.length < 1) {
      setValidationError("Please select at least 1 tool to continue");
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
    
    // Mark tools step as complete
    markStepComplete('tools');
    
    // Navigate to the next step using requestAnimationFrame for better DOM handling
    requestAnimationFrame(() => {
      if (isMobile) {
        toggleFullscreen('chart');
      } else {
        setCurrentStep('chart');
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
        
        <ToolSection
          tools={tools}
          selectedTools={selectedTools}
          removedTools={removedTools}
          selectedCriteria={selectedCriteria}
          filterConditions={filterConditions}
          filterMode={filterMode}
          onAddFilterCondition={onAddFilterCondition}
          onRemoveFilterCondition={onRemoveFilterCondition}
          onUpdateFilterCondition={onUpdateFilterCondition}
          onToggleFilterMode={onToggleFilterMode}
          onToolSelect={onToolSelect}
          onToolRemove={onToolRemove}
          onToolsReorder={onToolsReorder}
          onRestoreAll={onRestoreAll}
          onContinue={handleContinue}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}; 