import React, { useState, useEffect } from 'react';
import { CriteriaSection } from './components/CriteriaSection';
import { ToolSection } from './components/ToolSection';
import { ComparisonSection } from './components/ComparisonSection';
import { WelcomeScreen } from './components/WelcomeScreen';
import { 
  AppLoadingScreen, 
  SkeletonWrapper, 
  ToolListSkeleton, 
  CriteriaSkeletonLoader 
} from './components/LoadingStates';
import { defaultCriteria } from './data/criteria';
import { defaultTools } from './data/tools';
import { Tool, Criterion } from './types';
import { FilterCondition } from './components/filters/FilterSystem';
import { filterTools } from './utils/filterTools';
import { StepsSection } from './components/StepsSection';
import { Header } from './components/Header';
import { useFullscreen } from './contexts/FullscreenContext';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

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

export function App() {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isInitialSetup, setIsInitialSetup] = useState(true);

  // Ensure mobile always has a view selected
  useEffect(() => {
    if (isMobile && fullscreenView === 'none') {
      toggleFullscreen('criteria');
    }
  }, [isMobile, fullscreenView, toggleFullscreen]);

  // Check if user has seen welcome screen before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('ppm-tool-finder-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);
  const [selectedTools, setSelectedTools] = useState<Tool[]>(defaultTools);
  const [removedCriteria, setRemovedCriteria] = useState<Criterion[]>([]);
  const [removedTools, setRemovedTools] = useState<Tool[]>([]);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND');

  // Transform database tool to match Tool type
  const transformDatabaseTool = (dbTool: DbTool): Tool => {
    console.log('Raw DB Tools:', dbTool);
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
      criteria: dbTool.criteria as any || [],
      tags: dbTool.tags as any || [],
      created_on: dbTool.created_on,
      updated_at: dbTool.updated_at,
      submitted_at: dbTool.submitted_at,
      approved_at: dbTool.approved_at,
      submission_status: dbTool.submission_status || 'approved',
    };

    console.log('Transformed Tool:', transformedTool);
    return transformedTool;
  };

  // Fetch tools from database with enhanced loading states
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Simulate minimum loading time for better UX
        const [data] = await Promise.all([
          supabase
            .from('tools_view')
            .select('*')
            .eq('type', 'application'),
          new Promise(resolve => setTimeout(resolve, isInitialSetup ? 2000 : 500))
        ]);

        if (data.error) {
          throw data.error;
        }

        if (data.data) {
          const transformedTools = data.data.map(transformDatabaseTool);
          setSelectedTools(transformedTools);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        setFetchError('Failed to load tools. Please try again later.');
      } finally {
        setIsLoading(false);
        setIsInitialSetup(false);
      }
    };

    if (!showWelcome) {
      fetchTools();
    }
  }, [showWelcome, isInitialSetup]);

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
    setRemovedCriteria(removedCriteria.filter((c) => c.id !== criterion.id));
    setCriteria([...criteria, criterion]);
  };

  const handleRestoreAllCriteria = () => {
    setCriteria([...criteria, ...removedCriteria]);
    setRemovedCriteria([]);
  };

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

  const handleWelcomeGetStarted = () => {
    localStorage.setItem('ppm-tool-finder-welcome-seen', 'true');
    setShowWelcome(false);
  };

  const handleWelcomeSkip = () => {
    localStorage.setItem('ppm-tool-finder-welcome-seen', 'true');
    setShowWelcome(false);
  };

  // Show welcome screen
  if (showWelcome) {
    return (
      <WelcomeScreen 
        onGetStarted={handleWelcomeGetStarted}
        onSkip={handleWelcomeSkip}
      />
    );
  }

  // Show initial loading screen
  if (isInitialSetup && isLoading) {
    return <AppLoadingScreen />;
  }

  // Use user data when needed for premium features
  console.log('Current user:', user);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'mobile-view' : ''}`}>
      <Header />
      <StepsSection />

      {fetchError && (
        <div className="container mx-auto px-4 py-4">
          <div className="glass-card p-4 border-l-4 border-l-red-500 bg-red-50/80">
            <div className="text-red-700 font-medium">{fetchError}</div>
          </div>
        </div>
      )}

      {/* Desktop View */}
      {!isMobile && (
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-8 mb-10 sm:mb-14 lg:mb-8">
            <div className="lg:col-span-5">
              <SkeletonWrapper
                loading={isLoading}
                skeleton={<CriteriaSkeletonLoader />}
              >
                <CriteriaSection
                  criteria={criteria}
                  removedCriteria={removedCriteria}
                  onRemovedCriteriaChange={setRemovedCriteria}
                  onCriteriaChange={handleCriteriaChange}
                  onRemoveCriterion={handleRemoveCriterion}
                  onRestoreCriterion={handleRestoreCriterion}
                  onRestoreAll={handleRestoreAllCriteria}
                />
              </SkeletonWrapper>
            </div>
            <div className="lg:col-span-7">
              <SkeletonWrapper
                loading={isLoading}
                skeleton={<ToolListSkeleton />}
              >
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
              </SkeletonWrapper>
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
            <SkeletonWrapper
              loading={isLoading}
              skeleton={<CriteriaSkeletonLoader />}
            >
              <CriteriaSection
                criteria={criteria}
                removedCriteria={removedCriteria}
                onRemovedCriteriaChange={setRemovedCriteria}
                onCriteriaChange={handleCriteriaChange}
                onRemoveCriterion={handleRemoveCriterion}
                onRestoreCriterion={handleRestoreCriterion}
                onRestoreAll={handleRestoreAllCriteria}
              />
            </SkeletonWrapper>
          )}
          {fullscreenView === 'tools' && (
            <SkeletonWrapper
              loading={isLoading}
              skeleton={<ToolListSkeleton />}
            >
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
            </SkeletonWrapper>
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
    </div>
  );
}
