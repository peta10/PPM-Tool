import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/common/WelcomeScreen';
import { defaultCriteria } from '@/data/criteria';
import { defaultTools } from '@/data/tools';
import { Tool, Criterion, CriteriaRating, Tag } from '@/shared/types';
import { FilterCondition } from '@/components/filters/FilterSystem';
import { filterTools } from '@/shared/utils/filterTools';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLenis } from '@/shared/hooks/useLenis';
import { supabase } from '@/shared/lib/supabase';
import { StepProvider } from '@/shared/contexts/StepContext';
import { Router } from './Router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

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
  useAuth(); // Initialize auth state
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [startWithGuidedQuestions, setStartWithGuidedQuestions] = useState(false);

  // Initialize Lenis smooth scrolling - allow it to work normally
  useLenis({
    disabled: false, // Always allow scrolling
    lerp: isMobile ? 0.15 : 0.1,
    duration: isMobile ? 1 : 1.2,
    isMobile
  });

  // Ensure mobile always has a view selected
  useEffect(() => {
    if (isMobile && fullscreenView === 'none') {
      toggleFullscreen('criteria');
    }
  }, [isMobile, fullscreenView, toggleFullscreen]);

  // Always show welcome screen on initial load
  useEffect(() => {
    setShowWelcome(true);
  }, []);

  // Reset fullscreen view when welcome screen is shown
  useEffect(() => {
    if (showWelcome) {
      toggleFullscreen('none');
    }
  }, [showWelcome, toggleFullscreen]);

  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
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
      criteria: (dbTool.criteria || []) as CriteriaRating[],
      tags: (dbTool.tags || []) as unknown as Tag[],
      created_on: dbTool.created_on,
      updated_at: dbTool.updated_at,
      submitted_at: dbTool.submitted_at,
      approved_at: dbTool.approved_at,
      submission_status: dbTool.submission_status || 'approved',
    };

    console.log('Transformed Tool:', transformedTool);
    return transformedTool;
  };

  // Fetch tools from database in the background
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setFetchError(null);

        const { data, error } = await supabase
          .from('tools_view')
          .select('*')
          .eq('type', 'application')
          .eq('submission_status', 'approved'); // Only fetch approved tools

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
      }
    };

    if (!showWelcome) {
      fetchTools();
    }
  }, [showWelcome]);

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
    setStartWithGuidedQuestions(true); // Open guided questions automatically
    setShowWelcome(false);
  };

  const handleWelcomeSkip = () => {
    localStorage.setItem('ppm-tool-finder-welcome-seen', 'true');
    setStartWithGuidedQuestions(false); // Go to normal criteria view
    setShowWelcome(false);
  };

  // Reset guided questions flag after first use
  useEffect(() => {
    if (!showWelcome && startWithGuidedQuestions) {
      // Reset the flag after a short delay to allow the component to mount
      const timer = setTimeout(() => setStartWithGuidedQuestions(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, startWithGuidedQuestions]);

  // Show welcome screen
  if (showWelcome) {
    return (
      <WelcomeScreen 
        onGetStarted={handleWelcomeGetStarted}
        onSkip={handleWelcomeSkip}
      />
    );
  }

  // Use user data when needed for premium features

  // Render error message if fetch failed
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
      <StepProvider>
        <Router
          criteria={criteria}
          removedCriteria={removedCriteria}
          selectedTools={filteredTools}
          removedTools={removedTools}
          filterConditions={filterConditions}
          filterMode={filterMode}
          onCriteriaChange={handleCriteriaChange}
          onRemoveCriterion={handleRemoveCriterion}
          onRestoreCriterion={handleRestoreCriterion}
          onRestoreAllCriteria={handleRestoreAllCriteria}
          onToolSelect={handleToolSelect}
          onToolRemove={handleToolRemove}
          onToolsReorder={handleToolsReorder}
          onRestoreAllTools={handleRestoreAllTools}
          onAddFilterCondition={handleAddFilterCondition}
          onRemoveFilterCondition={handleRemoveFilterCondition}
          onUpdateFilterCondition={handleUpdateFilterCondition}
          onToggleFilterMode={handleToggleFilterMode}
          onRemovedCriteriaChange={setRemovedCriteria}
          tools={defaultTools}
          startWithGuidedQuestions={startWithGuidedQuestions}
        />
      </StepProvider>
    </ErrorBoundary>
  );
}
