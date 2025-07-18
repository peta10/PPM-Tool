import React, { useState, useEffect } from 'react';
import { CriteriaSection } from '@/features/criteria/components/CriteriaSection';
import { ToolSection } from '@/features/tools/ToolSection';
import { ComparisonChart } from '@/components/charts/ComparisonChart';
import { EnhancedRecommendationSection } from '@/features/recommendations/components/EnhancedRecommendationSection';
import { ResultsPage } from '@/pages/ResultsPage';
import { defaultCriteria } from '@/data/criteria';
import { defaultTools } from '@/data/tools';
import { Tool, Criterion, CriteriaRating, Tag } from '@/shared/types';
import { FilterCondition } from '@/components/filters/FilterSystem';
import { filterTools } from '@/shared/utils/filterTools';
import { supabase } from '@/shared/lib/supabase';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppLoadingScreen } from '@/components/common/LoadingStates';
import { StepProvider } from '@/shared/contexts/StepContext';
import { FullscreenProvider } from '@/shared/contexts/FullscreenContext';

type Step = 'criteria' | 'tools' | 'chart' | 'recommendations' | 'results';

interface DbCriterion {
  id: string;
  ranking: number;
  description?: string;
}

interface DbTag {
  name: string;
  tag_type: {
    name: string;
  };
}

interface DbTool {
  id: string;
  name: string;
  type: string;
  created_by: string;
  criteria: DbCriterion[];
  tags: DbTag[];
  created_on: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  submission_status?: string;
}

export const EmbeddedPPMToolFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('criteria');
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [removedCriteria, setRemovedCriteria] = useState<Criterion[]>([]);
  const [removedTools, setRemovedTools] = useState<Tool[]>([]);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [startWithGuidedQuestions] = useState(false);

  // Transform database tool to match Tool type
  const transformDatabaseTool = (dbTool: DbTool): Tool => {
    const ratings: Record<string, number> = {};
    const ratingExplanations: Record<string, string> = {};
    const methodologies: string[] = [];
    const functions: string[] = [];

    try {
      // Process criteria ratings and explanations
      if (Array.isArray(dbTool.criteria)) {
        dbTool.criteria.forEach((criterion: DbCriterion) => {
          if (criterion && criterion.id && typeof criterion.ranking === 'number') {
            ratings[criterion.id] = criterion.ranking;
            if (criterion.description) {
              ratingExplanations[criterion.id] = criterion.description;
            }
          }
        });
      }

      // Process tags for methodologies and functions
      if (Array.isArray(dbTool.tags)) {
        dbTool.tags.forEach((tag: DbTag) => {
          if (tag && tag.name && tag.tag_type) {
            if (tag.tag_type.name === 'Methodology') {
              methodologies.push(tag.name);
            } else if (tag.tag_type.name === 'Function') {
              functions.push(tag.name);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error processing tool data:', error);
    }

    return {
      id: dbTool.id,
      name: dbTool.name,
      logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=64&h=64&fit=crop',
      useCases: Array.from(new Set([...methodologies, ...functions])),
      methodologies,
      functions,
      ratings,
      ratingExplanations,
      type: dbTool.type,
      created_by: dbTool.created_by,
      criteria: (dbTool.criteria || []) as unknown as CriteriaRating[],
      tags: (dbTool.tags || []) as unknown as Tag[],
      created_on: dbTool.created_on,
      updated_at: dbTool.updated_at,
      submitted_at: dbTool.submitted_at,
      approved_at: dbTool.approved_at,
      submission_status: dbTool.submission_status || 'approved',
    };
  };

  // Fetch tools from database
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setFetchError(null);
        setIsLoading(true);

        const { data, error } = await supabase
          .from('tools_view')
          .select('*')
          .eq('type', 'application')
          .eq('submission_status', 'approved');

        if (error) {
          throw error;
        }

        if (data) {
          console.log('Fetched approved tools:', data.length, 'tools');
          const transformedTools = data.map(transformDatabaseTool);
          setSelectedTools(transformedTools);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        setFetchError('Failed to load tools. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  const filteredTools = filterTools(selectedTools, filterConditions, filterMode);

  // Handlers for criteria
  const handleCriteriaChange = (newCriteria: Criterion[]) => {
    setCriteria(newCriteria);
  };

  const handleRemoveCriterion = (criterion: Criterion) => {
    setCriteria(criteria.filter((c) => c.id !== criterion.id));
    setRemovedCriteria([...removedCriteria, criterion]);
  };

  const handleRestoreCriterion = (criterion: Criterion) => {
    setRemovedCriteria(removedCriteria.filter((c) => c.id !== criterion.id));
    setCriteria([...criteria, criterion]);
  };

  const handleRestoreAllCriteria = () => {
    setCriteria([...criteria, ...removedCriteria]);
    setRemovedCriteria([]);
  };

  // Handlers for tools
  const handleToolSelect = (tool: Tool) => {
    setSelectedTools([...selectedTools, tool]);
  };

  const handleRestoreAllTools = () => {
    setSelectedTools([...selectedTools, ...removedTools]);
    setRemovedTools([]);
  };

  const handleToolRemove = (toolId: string) => {
    const toolToRemove = selectedTools.find((t) => t.id === toolId);
    if (toolToRemove) {
      setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
      setRemovedTools([...removedTools, toolToRemove]);
    }
  };

  const handleToolsReorder = (newTools: Tool[]) => {
    setSelectedTools(newTools);
  };

  // Handlers for filters
  const handleAddFilterCondition = () => {
    setFilterConditions([
      ...filterConditions,
      { id: Date.now().toString(), type: 'Methodology', value: '' },
    ]);
  };

  const handleRemoveFilterCondition = (id: string) => {
    setFilterConditions(filterConditions.filter((c) => c.id !== id));
  };

  const handleUpdateFilterCondition = (
    id: string,
    updates: Partial<FilterCondition>
  ) => {
    setFilterConditions(
      filterConditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleToggleFilterMode = () => {
    setFilterMode(filterMode === 'AND' ? 'OR' : 'AND');
  };

  // Step navigation handlers
  const handleCriteriaContinue = () => {
    setCurrentStep('tools');
  };

  const handleToolsContinue = () => {
    setCurrentStep('chart');
  };

  const handleChartContinue = () => {
    setCurrentStep('recommendations');
  };

  const handleRecommendationsContinue = () => {
    setCurrentStep('results');
  };

  // Show loading state
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="glass-card p-4 border-l-4 border-l-red-500 bg-red-50/80">
          <div className="text-red-700 font-medium">{fetchError}</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <FullscreenProvider>
        <StepProvider>
          <div className="w-full max-w-none">
        {currentStep === 'criteria' && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="container mx-auto px-4 py-8">
              <CriteriaSection
                criteria={criteria}
                removedCriteria={removedCriteria}
                onRemovedCriteriaChange={setRemovedCriteria}
                onCriteriaChange={handleCriteriaChange}
                onRemoveCriterion={handleRemoveCriterion}
                onRestoreCriterion={handleRestoreCriterion}
                onRestoreAll={handleRestoreAllCriteria}
                onContinue={handleCriteriaContinue}
                startWithGuidedQuestions={startWithGuidedQuestions}
              />
            </main>
          </div>
        )}

        {currentStep === 'tools' && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="container mx-auto px-4 py-8">
              <ToolSection
                tools={defaultTools}
                selectedTools={filteredTools}
                removedTools={removedTools}
                selectedCriteria={criteria}
                filterConditions={filterConditions}
                filterMode={filterMode}
                onAddFilterCondition={handleAddFilterCondition}
                onRemoveFilterCondition={handleRemoveFilterCondition}
                onUpdateFilterCondition={handleUpdateFilterCondition}
                onToggleFilterMode={handleToggleFilterMode}
                onToolSelect={handleToolSelect}
                onToolRemove={handleToolRemove}
                onToolsReorder={handleToolsReorder}
                onRestoreAll={handleRestoreAllTools}
                onContinue={handleToolsContinue}
              />
            </main>
          </div>
        )}

        {currentStep === 'chart' && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="container mx-auto px-4 py-8">
              <ComparisonChart
                selectedTools={filteredTools}
                selectedCriteria={criteria}
              />
              <div className="mt-8 text-center">
                <button
                  onClick={handleChartContinue}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue to Recommendations
                </button>
              </div>
            </main>
          </div>
        )}

        {currentStep === 'recommendations' && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="container mx-auto px-4 py-8">
              <EnhancedRecommendationSection
                selectedTools={filteredTools}
                selectedCriteria={criteria}
                onContinue={handleRecommendationsContinue}
              />
            </main>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <main className="container mx-auto px-4 py-8">
              <ResultsPage
                selectedTools={filteredTools}
                selectedCriteria={criteria}
              />
            </main>
          </div>
        )}
          </div>
        </StepProvider>
      </FullscreenProvider>
    </ErrorBoundary>
  );
}; 