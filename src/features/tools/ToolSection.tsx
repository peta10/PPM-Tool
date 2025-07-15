import React, { useState } from 'react';
import { Tool, Criterion } from '@/shared/types';
import { Maximize2, Minimize2, Settings, X, Award, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { FilterSystem, FilterCondition } from '@/components/filters/FilterSystem';
import { EnhancedCompactToolCard } from '@/components/cards/EnhancedCompactToolCard';
import { RemovedToolsMenu } from './RemovedToolsMenu';
import { DraggableList } from '@/components/interactive/DraggableList';
import { DraggableItem } from '@/components/interactive/DraggableItem';
import { filterTools } from '@/shared/utils/filterTools';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { FullscreenNavigation } from '@/components/layout/FullscreenNavigation';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';


interface ToolSectionProps {
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
  onContinue?: () => void;
  isSubmitting?: boolean;
}

// Calculate match score function
const calculateMatchScore = (tool: Tool, criteria: Criterion[]): number => {
  let totalScore = 0;
  let meetsAllCriteria = true;

  criteria.forEach((criterion) => {
    // Get tool rating using the same logic as CompactToolCard
    let toolRating = 0;
    
    try {
      if (Array.isArray(tool.criteria)) {
        const criterionDataById = tool.criteria.find(c => c.id === criterion.id);
        if (criterionDataById && typeof criterionDataById.ranking === 'number') {
          toolRating = criterionDataById.ranking;
        } else {
          const criterionDataByName = tool.criteria.find(c => c.name === criterion.name);
          if (criterionDataByName && typeof criterionDataByName.ranking === 'number') {
            toolRating = criterionDataByName.ranking;
          }
        }
      }

      if (toolRating === 0 && tool.ratings && typeof tool.ratings[criterion.id] === 'number') {
        toolRating = tool.ratings[criterion.id];
      }
      
      if (toolRating === 0) {
        const criterionMappings: Record<string, string[]> = {
          'scalability': ['Scalability', 'scalability'],
          'integrations': ['Integrations & Extensibility', 'integrations', 'Integrations'],
          'easeOfUse': ['Ease of Use', 'easeOfUse', 'ease_of_use', 'ease-of-use'],
          'flexibility': ['Flexibility & Customization', 'flexibility', 'customization'],
          'ppmFeatures': ['Project Portfolio Management', 'ppmFeatures', 'ppm_features', 'ppm'],
          'reporting': ['Reporting & Analytics', 'reporting', 'analytics'],
          'security': ['Security & Compliance', 'security', 'compliance']
        };
        
        const possibleKeys = criterionMappings[criterion.id] || [criterion.name, criterion.id];
        
        for (const key of possibleKeys) {
          if (tool.ratings && typeof tool.ratings[key] === 'number') {
            toolRating = tool.ratings[key];
            break;
          }
        }
      }
    } catch (error) {
      console.error(`Error getting rating for criterion ${criterion.name}:`, error);
      toolRating = 0;
    }

    const userRating = criterion.userRating;

    // Check if tool meets or exceeds requirement
    if (toolRating < userRating) {
      meetsAllCriteria = false;
    }

    // Calculate score based on how well tool meets requirements
    if (toolRating >= userRating) {
      const excess = Math.min(toolRating - userRating, 2);
      totalScore += 8 + excess;
    } else {
      const shortfall = userRating - toolRating;
      totalScore += Math.max(0, 7 - shortfall * 2);
    }
  });

  // Calculate average score
  let finalScore = totalScore / criteria.length;

  // If tool meets or exceeds ALL criteria, it gets a perfect 10
  if (meetsAllCriteria) {
    finalScore = 10;
  }

  return finalScore;
};

export const ToolSection: React.FC<ToolSectionProps> = ({
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
  onToolsReorder,
  onRestoreAll,
  onContinue,
  isSubmitting
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const isFullscreen = fullscreenView === 'tools';
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [incompleteFilterId, setIncompleteFilterId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const settingsRef = React.useRef<HTMLDivElement>(null);
  
  const filteredTools = filterTools(selectedTools, filterConditions, filterMode);

  // Memoize match scores for performance
  const toolMatchScores = React.useMemo(() => {
    const scores = new Map<string, number>();
    filteredTools.forEach(tool => {
      scores.set(tool.id, calculateMatchScore(tool, selectedCriteria));
    });
    return scores;
  }, [filteredTools, selectedCriteria]);

  // Sort tools by match score (highest first)
  const sortedTools = React.useMemo(() => {
    return [...filteredTools].sort((a, b) => {
      const scoreA = toolMatchScores.get(a.id) || 0;
      const scoreB = toolMatchScores.get(b.id) || 0;
      return scoreB - scoreA;
    });
  }, [filteredTools, toolMatchScores]);

  const handleToggleExpand = (toolId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedCards(newExpanded);
  };
  
  const filteredOutTools = React.useMemo(() => {
    const removedToolIds = new Set(removedTools.map(tool => tool.id));
    const availableTools = tools.filter(tool => !removedToolIds.has(tool.id));
    return availableTools.filter(tool => 
      !filterTools([tool], filterConditions, filterMode, true).length
    ); 
  }, [filterConditions, filterMode, removedTools, tools]);

  useClickOutside(settingsRef, () => {
    handleSettingsClose();
  });

  const handleSettingsClose = () => {
    // Only prevent closing if there are truly problematic incomplete filters
    const problematicFilters = filterConditions.filter(condition => {
      // Only consider it problematic if type is set but other required fields are missing
      if (!condition.type) return false; // Empty filters are fine, will be ignored
      if (condition.type === 'Criteria') {
        // For criteria filters, we need all three: value, operator, and rating
        return !condition.value || !condition.operator || condition.rating === undefined;
      }
      // For methodology/function filters, we just need the value
      return !condition.value;
    });

    if (problematicFilters.length > 0) {
      setIncompleteFilterId('all');
      setTimeout(() => setIncompleteFilterId(null), 3000);
      return;
    }

    // Auto-remove completely empty filters when closing
    const cleanedFilters = filterConditions.filter(condition => 
      condition.type && condition.value
    );
    
    if (cleanedFilters.length !== filterConditions.length) {
      // Remove empty filters
      const emptyFilterIds = filterConditions
        .filter(condition => !condition.type || !condition.value)
        .map(condition => condition.id);
      
      emptyFilterIds.forEach(id => onRemoveFilterCondition(id));
    }

    setIsSettingsOpen(false);
  };

  const showRemovedToolsMenu = removedTools.length > 0;

  const renderTool = (tool: Tool) => (
    <DraggableItem key={tool.id} id={tool.id}>
      <div className="pl-8">
        <EnhancedCompactToolCard
          tool={tool}
          selectedCriteria={selectedCriteria}
          matchScore={toolMatchScores.get(tool.id) || 0}
          isExpanded={expandedCards.has(tool.id)}
          onToggleExpand={() => handleToggleExpand(tool.id)}
        />
      </div>
    </DraggableItem>
  );

  return (
    <div id="tools-section" className={`bg-white rounded-lg shadow-lg flex flex-col ${isFullscreen ? 'fullscreen-container' : ''}`}>
      <div className="flex flex-col h-full">
        {isFullscreen && !isMobile && (
          <div className="flex-shrink-0">
            <Header />
            <StepsSection />
          </div>
        )}
        
        {isFullscreen && isMobile && (
          <div className="flex-shrink-0 bg-white">
            <Header />
            <StepsSection />
          </div>
        )}

        {/* Fixed Header Section */}
        <div className="flex items-center justify-between p-6 pb-4 border-b bg-alpine-blue-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Award className="w-6 h-6 mr-2 text-alpine-blue-500" />
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-midnight-800">Tools & Recommendations</h2>
                <span className="hidden lg:block ml-2 text-sm text-midnight-600">
                  {sortedTools.length} {sortedTools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center space-x-2">
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 hover:bg-alpine-blue-100 rounded-lg"
                aria-label="Filter settings"
              >
                <Settings className="w-5 h-5 text-alpine-blue-600" />
              </button>
              {isSettingsOpen && (
                <div className="settings-overlay">
                  <div className="fixed inset-0" onClick={handleSettingsClose} />
                  <div className="settings-content">
                    <div className="flex items-center justify-between p-3 border-b">
                      <div>
                        <h3 className="font-medium">Tool Settings</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {sortedTools.length} {sortedTools.length === 1 ? 'tool' : 'tools'} visible
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onRestoreAll();
                            handleSettingsClose();
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-alpine-blue-500 hover:bg-alpine-blue-600 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                        >
                          Reset All
                        </button>
                        <button
                          onClick={handleSettingsClose}
                          className={`text-gray-400 hover:text-gray-600 ${incompleteFilterId ? 'animate-shake' : ''}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {incompleteFilterId && (
                          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-red-50 text-red-600 text-xs py-1 px-2 rounded border border-red-200">
                            Complete all filter fields
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <FilterSystem
                        selectedCriteria={selectedCriteria}
                        conditions={filterConditions}
                        incompleteFilterId={incompleteFilterId}
                        onAddCondition={onAddFilterCondition}
                        onRemoveCondition={onRemoveFilterCondition}
                        onUpdateCondition={onUpdateFilterCondition}
                        filterMode={filterMode}
                        onToggleFilterMode={onToggleFilterMode}
                      />
                      
                      {filterConditions.length > 0 && selectedTools.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">
                              {filteredOutTools.length} {filteredOutTools.length === 1 ? 'tool' : 'tools'} filtered out
                              <em> (adjust filters to add back)</em>
                            </span>
                          </div>
                          {filteredOutTools.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {filteredOutTools.map((tool) => (
                                <div
                                  key={tool.id}
                                  className="group flex items-center space-x-2 px-3 py-1.5 bg-gray-50/50 rounded-lg border border-gray-200 text-gray-500"
                                >
                                  <img
                                    src={tool.logo}
                                    alt={`${tool.name} logo`}
                                    className="w-6 h-6 rounded-full object-cover opacity-75"
                                  />
                                  <span className="text-sm">{tool.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">All tools match the current filters</p>
                          )}
                        </div>
                      )}

                      {showRemovedToolsMenu && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">
                              {removedTools.length} {removedTools.length === 1 ? 'tool' : 'tools'} removed
                              <button
                                onClick={onRestoreAll}
                                className="ml-2 text-sm text-alpine-blue-500 hover:text-alpine-blue-700"
                              >
                                Add Back All
                              </button>
                            </span>
                          </div>
                          <RemovedToolsMenu
                            removedTools={removedTools}
                            onRestore={onToolSelect}
                            onRestoreAll={onRestoreAll}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <FullscreenNavigation />
            {!isMobile && (
              <button
                onClick={() => toggleFullscreen('tools')}
                className="p-2 hover:bg-alpine-blue-100 rounded-lg transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-alpine-blue-600" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-alpine-blue-600" />
                )}
              </button>
            )}
            {onContinue && (
              <button
                onClick={onContinue}
                disabled={isSubmitting}
                className={`
                  flex items-center px-4 py-2 
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
                    Continue to Chart Analysis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>



        {/* Instructions Section */}
        <div className="flex-shrink-0 border-b bg-gray-50">
          <div className="px-6">
            <div className="relative">
              <button
                onClick={() => setInstructionsCollapsed(!instructionsCollapsed)}
                className="w-full flex items-center justify-between py-3 text-left group"
              >
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Tool Instructions</span>
                {instructionsCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                )}
              </button>
              {!instructionsCollapsed && (
                <div className="py-3">
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      Browse tools sorted by match score based on your criteria rankings:
                    </p>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Match Scores:</span>
                        <span>Tools are ranked by how well they meet your requirements (10/10 = perfect match)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Methodology:</span>
                        <span>Use Waterfall/Agile buttons to quickly filter tools by development approach</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Details:</span>
                        <span>Click "View detailed breakdown" to see how each tool scores against your criteria</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Export:</span>
                        <span>Download a comprehensive PDF report with all analysis and recommendations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Filters:</span>
                        <span>Access advanced filters through settings (⚙️) to refine by function, criteria scores, and more</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 italic">
                      Tools are automatically sorted with the best matches at the top
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div 
          className={`p-6 ${!isFullscreen && 'section-scroll'}`}
        >
          {sortedTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Award className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools match your current filters</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or criteria to see more results.</p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-alpine-blue-500 text-white rounded-lg hover:bg-alpine-blue-600 transition-colors"
              >
                Adjust Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <DraggableList
                items={sortedTools}
                onReorder={onToolsReorder}
                renderItem={renderTool}
                getItemId={(tool) => tool.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};