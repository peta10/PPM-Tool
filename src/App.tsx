import React, { useState, useEffect } from 'react';
import { CriteriaSection } from './components/CriteriaSection';
import { ToolSection } from './components/ToolSection';
import { ComparisonSection } from './components/ComparisonSection';
import { defaultCriteria } from './data/criteria';
import { defaultTools } from './data/tools';
import { Tool, Criterion } from './types';
import { Boxes, X } from 'lucide-react';
import { FilterCondition } from './components/filters/FilterSystem';
import { filterTools } from './utils/filterTools';
import { StepsSection } from './components/StepsSection';
import { Header } from './components/Header';
import { useFullscreen } from './contexts/FullscreenContext';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

type FilterType = 'Methodology' | 'Function' | 'Criteria';

export function App() {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Ensure mobile always has a view selected
  useEffect(() => {
    if (isMobile && fullscreenView === 'none') {
      toggleFullscreen('criteria');
    }
  }, [isMobile, fullscreenView, toggleFullscreen]);
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);
  const [selectedTools, setSelectedTools] = useState<Tool[]>(defaultTools);
  const [removedCriteria, setRemovedCriteria] = useState<Criterion[]>([]);
  const [removedTools, setRemovedTools] = useState<Tool[]>([]);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    []
  );
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND');

  // Transform database tool to match Tool type
  const transformDatabaseTool = (dbTool: any): Tool => {
    console.log('Raw DB Tools:', dbTool);
    const ratings: Record<string, number> = {};
    const ratingExplanations: Record<string, string> = {};
    const methodologies: string[] = [];
    const functions: string[] = [];

    try {
      // Process criteria ratings and explanations
      if (Array.isArray(dbTool.criteria)) {
        dbTool.criteria.forEach((criterion: any) => {
          if (criterion.id && typeof criterion.ranking === 'number') {
            ratings[criterion.id] = criterion.ranking;
            ratingExplanations[criterion.id] = criterion.description || '';
          }
        });
      }

      console.log('Processed Ratings:', ratings);
      console.log('Processed Explanations:', ratingExplanations);

      // Process tags
      if (Array.isArray(dbTool.tags)) {
        dbTool.tags.forEach((tag: any) => {
          if (tag && tag.type && tag.name) {
            if (tag.type === 'Methodology') {
              methodologies.push(tag.name);
            } else if (tag.type === 'Function') {
              functions.push(tag.name);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error transforming tool data:', err);
    }

    const transformedTool: Tool = {
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
      criteria: dbTool.criteria || [],
      tags: dbTool.tags || [],
      created_on: dbTool.created_on,
      updated_at: dbTool.updated_at,
      submitted_at: dbTool.submitted_at,
      approved_at: dbTool.approved_at,
      submission_status: dbTool.submission_status || 'approved',
    };

    console.log('Transformed Tool:', transformedTool);
    return transformedTool;
  };

  // Fetch tools from database
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const { data, error } = await supabase
          .from('tools_view')
          .select('*')
          .eq('type', 'application');

        if (error) {
          throw error;
        }

        if (data) {
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

  const filteredTools = filterTools(
    selectedTools,
    filterConditions,
    filterMode
  );

  const handleCriteriaChange = (newCriteria: Criterion[]) => {
    setCriteria(newCriteria);
  };

  const handleRemoveCriterion = (criterion: Criterion) => {
    setCriteria(criteria.filter((c) => c.id !== criterion.id));
    setRemovedCriteria([...removedCriteria, criterion]);
  };

  const handleRestoreCriterion = (criterion: Criterion) => {
    // Keep the existing rating when restoring
    setCriteria([criterion, ...criteria]);
    setRemovedCriteria(removedCriteria.filter((c) => c.id !== criterion.id));
  };

  const handleRestoreAllCriteria = () => {
    // Combine all criteria and reset their ratings to 5
    const updatedCriteria = [...removedCriteria, ...criteria].map(
      (criterion) => ({
        ...criterion,
        userRating: 5,
      })
    );
    setCriteria(updatedCriteria);
    setRemovedCriteria([]);
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedTools([tool, ...selectedTools]);
    setRemovedTools(removedTools.filter((t) => t.id !== tool.id));
  };

  const handleRestoreAllTools = () => {
    setSelectedTools(defaultTools);
    setRemovedTools([]);
    setFilterConditions([]);
  };

  const handleToolRemove = (toolId: string) => {
    const removedTool = selectedTools.find((t) => t.id === toolId);
    if (removedTool) {
      setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
      setRemovedTools([...removedTools, removedTool]);
    }
  };

  const handleToolsReorder = (newTools: Tool[]) => {
    setSelectedTools(newTools);
  };

  const handleAddFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: crypto.randomUUID(),
      type: '' as FilterType,
      value: '',
    };
    setFilterConditions([...filterConditions, newCondition]);
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
    setFilterMode((mode) => (mode === 'AND' ? 'OR' : 'AND'));
  };

  return (
    <div
      className={`min-h-screen bg-snow-white ${isMobile ? 'mobile-view' : ''}`}
    >
      <Header />
      <StepsSection />

      {fetchError && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {fetchError}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="container mx-auto px-4 py-8 text-center text-midnight">
          Loading tools...
        </div>
      ) : (
        <>
          {/* Desktop View */}
          {!isMobile && (
            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-8 mb-10 sm:mb-14 lg:mb-8">
                <div className="lg:col-span-5">
                  <CriteriaSection
                    criteria={criteria}
                    removedCriteria={removedCriteria}
                    onRemovedCriteriaChange={setRemovedCriteria}
                    onCriteriaChange={handleCriteriaChange}
                    onRemoveCriterion={handleRemoveCriterion}
                    onRestoreCriterion={handleRestoreCriterion}
                    onRestoreAll={handleRestoreAllCriteria}
                  />
                </div>
                <div className="lg:col-span-7">
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
                  />
                </div>
              </div>
              <div className="mt-10 sm:mt-14 lg:mt-8">
                <ComparisonSection
                  selectedTools={filteredTools}
                  selectedCriteria={criteria}
                />
              </div>
            </main>
          )}

          {/* Mobile View */}
          {isMobile && fullscreenView !== 'none' && (
            <div className="flex-1 flex flex-col">
              {fullscreenView === 'criteria' && (
                <CriteriaSection
                  criteria={criteria}
                  removedCriteria={removedCriteria}
                  onRemovedCriteriaChange={setRemovedCriteria}
                  onCriteriaChange={handleCriteriaChange}
                  onRemoveCriterion={handleRemoveCriterion}
                  onRestoreCriterion={handleRestoreCriterion}
                  onRestoreAll={handleRestoreAllCriteria}
                />
              )}
              {fullscreenView === 'tools' && (
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
                />
              )}
              {(fullscreenView === 'chart' ||
                fullscreenView === 'recommendations') && (
                <ComparisonSection
                  selectedTools={filteredTools}
                  selectedCriteria={criteria}
                />
              )}
            </div>
          )}
        </>
      )}

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} PPM Tool Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
