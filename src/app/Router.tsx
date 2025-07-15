import React from 'react';
import { useSteps } from '@/shared/contexts/StepContext';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { CriteriaPage, ToolsPage, ComparisonPage, RecommendationsPage, ResultsPage } from '@/pages/index';
import { Tool, Criterion } from '@/shared/types';
import { FilterCondition } from '@/components/filters/FilterSystem';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface RouterProps {
  criteria: Criterion[];
  removedCriteria: Criterion[];
  selectedTools: Tool[];
  removedTools: Tool[];
  filterConditions: FilterCondition[];
  filterMode: 'AND' | 'OR';
  onCriteriaChange: (criteria: Criterion[]) => void;
  onRemoveCriterion: (criterion: Criterion) => void;
  onRestoreCriterion: (criterion: Criterion) => void;
  onRestoreAllCriteria: () => void;
  onToolSelect: (tool: Tool) => void;
  onToolRemove: (toolId: string) => void;
  onToolsReorder: (tools: Tool[]) => void;
  onRestoreAllTools: () => void;
  onAddFilterCondition: () => void;
  onRemoveFilterCondition: (id: string) => void;
  onUpdateFilterCondition: (id: string, updates: Partial<FilterCondition>) => void;
  onToggleFilterMode: () => void;
  onRemovedCriteriaChange: (criteria: Criterion[]) => void;
  tools: Tool[];
}

export const Router: React.FC<RouterProps> = ({
  criteria,
  removedCriteria,
  selectedTools,
  removedTools,
  filterConditions,
  filterMode,
  onCriteriaChange,
  onRemoveCriterion,
  onRestoreCriterion,
  onRestoreAllCriteria,
  onToolSelect,
  onToolRemove,
  onToolsReorder,
  onRestoreAllTools,
  onAddFilterCondition,
  onRemoveFilterCondition,
  onUpdateFilterCondition,
  onToggleFilterMode,
  onRemovedCriteriaChange,
  tools,
}) => {
  const { currentStep } = useSteps();
  const { isMobile, fullscreenView } = useFullscreen();

  // For desktop view, render the appropriate page based on the current step
  if (!isMobile) {
    switch (currentStep) {
      case 'criteria':
        return (
          <ErrorBoundary>
            <CriteriaPage
              criteria={criteria}
              removedCriteria={removedCriteria}
              onRemovedCriteriaChange={onRemovedCriteriaChange}
              onCriteriaChange={onCriteriaChange}
              onRemoveCriterion={onRemoveCriterion}
              onRestoreCriterion={onRestoreCriterion}
              onRestoreAll={onRestoreAllCriteria}
            />
          </ErrorBoundary>
        );
      case 'tools':
        return (
          <ErrorBoundary>
            <ToolsPage
              tools={tools}
              selectedTools={selectedTools}
              removedTools={removedTools}
              selectedCriteria={criteria}
              filterConditions={filterConditions}
              filterMode={filterMode}
              onAddFilterCondition={onAddFilterCondition}
              onRemoveFilterCondition={onRemoveFilterCondition}
              onUpdateFilterCondition={onUpdateFilterCondition}
              onToggleFilterMode={onToggleFilterMode}
              onToolSelect={onToolSelect}
              onToolRemove={onToolRemove}
              onToolsReorder={onToolsReorder}
              onRestoreAll={onRestoreAllTools}
            />
          </ErrorBoundary>
        );
      case 'chart':
        return (
          <ErrorBoundary>
            <ComparisonPage
              selectedTools={selectedTools}
              selectedCriteria={criteria}
            />
          </ErrorBoundary>
        );
      case 'recommendations':
        return (
          <ErrorBoundary>
            <RecommendationsPage
              selectedTools={selectedTools}
              selectedCriteria={criteria}
            />
          </ErrorBoundary>
        );
      case 'results':
        return (
          <ErrorBoundary>
            <ResultsPage
              selectedTools={selectedTools}
              selectedCriteria={criteria}
            />
          </ErrorBoundary>
        );
      default:
        return (
          <CriteriaPage
            criteria={criteria}
            removedCriteria={removedCriteria}
            onRemovedCriteriaChange={onRemovedCriteriaChange}
            onCriteriaChange={onCriteriaChange}
            onRemoveCriterion={onRemoveCriterion}
            onRestoreCriterion={onRestoreCriterion}
            onRestoreAll={onRestoreAllCriteria}
          />
        );
    }
  }

  // For mobile view, render based on fullscreen view
  switch (fullscreenView) {
    case 'criteria':
      return (
        <ErrorBoundary>
          <CriteriaPage
            criteria={criteria}
            removedCriteria={removedCriteria}
            onRemovedCriteriaChange={onRemovedCriteriaChange}
            onCriteriaChange={onCriteriaChange}
            onRemoveCriterion={onRemoveCriterion}
            onRestoreCriterion={onRestoreCriterion}
            onRestoreAll={onRestoreAllCriteria}
          />
        </ErrorBoundary>
      );
    case 'tools':
      return (
        <ErrorBoundary>
          <ToolsPage
            tools={tools}
            selectedTools={selectedTools}
            removedTools={removedTools}
            selectedCriteria={criteria}
            filterConditions={filterConditions}
            filterMode={filterMode}
            onAddFilterCondition={onAddFilterCondition}
            onRemoveFilterCondition={onRemoveFilterCondition}
            onUpdateFilterCondition={onUpdateFilterCondition}
            onToggleFilterMode={onToggleFilterMode}
            onToolSelect={onToolSelect}
            onToolRemove={onToolRemove}
            onToolsReorder={onToolsReorder}
            onRestoreAll={onRestoreAllTools}
          />
        </ErrorBoundary>
      );
    case 'chart':
      return (
        <ErrorBoundary>
          <ComparisonPage
            selectedTools={selectedTools}
            selectedCriteria={criteria}
          />
        </ErrorBoundary>
      );
    case 'recommendations':
      return (
        <ErrorBoundary>
          <RecommendationsPage
            selectedTools={selectedTools}
            selectedCriteria={criteria}
          />
        </ErrorBoundary>
      );
    case 'results':
      return (
        <ErrorBoundary>
          <ResultsPage
            selectedTools={selectedTools}
            selectedCriteria={criteria}
          />
        </ErrorBoundary>
      );
    default:
      return (
        <CriteriaPage
          criteria={criteria}
          removedCriteria={removedCriteria}
          onRemovedCriteriaChange={onRemovedCriteriaChange}
          onCriteriaChange={onCriteriaChange}
          onRemoveCriterion={onRemoveCriterion}
          onRestoreCriterion={onRestoreCriterion}
          onRestoreAll={onRestoreAllCriteria}
        />
      );
  }
}; 