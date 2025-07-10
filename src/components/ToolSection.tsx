import React, { useState } from 'react';
import { Tool, Criterion } from '../types';
import { Layout, Maximize2, Minimize2, Settings, X, Filter, AlertCircle } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { FilterSystem, FilterCondition, FilterType } from './filters/FilterSystem';
import { ToolCard } from './ToolCard';
import { RemovedToolsMenu } from './RemovedToolsMenu';
import { DraggableList } from './DraggableList';
import { DraggableItem } from './DraggableItem';
import { filterTools } from '../utils/filterTools';
import { useFullscreen } from '../contexts/FullscreenContext';
import { FullscreenNavigation } from './FullscreenNavigation';
import { Header } from './Header';
import { StepsSection } from './StepsSection';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
}

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
  onToolRemove,
  onToolsReorder,
  onRestoreAll
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const isFullscreen = fullscreenView === 'tools';
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMethodologies, setActiveMethodologies] = useState<Set<string>>(new Set());
  const [incompleteFilterId, setIncompleteFilterId] = useState<string | null>(null);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const filteredTools = filterTools(selectedTools, filterConditions, filterMode);

  const handleMethodologyClick = (methodology: string) => {
    // Check if this methodology is already in the filter conditions
    const existingCondition = filterConditions.find(
      c => c.type === 'Methodology' && c.value === methodology
    );

    if (existingCondition) {
      // If it exists, remove it
      const conditionToRemove = filterConditions.find(
        c => c.type === 'Methodology' && c.value === methodology
      );
      if (conditionToRemove) {
        onRemoveFilterCondition(conditionToRemove.id);
      }
    } else {
      // If it doesn't exist, add it
      onAddFilterCondition();
      const newCondition = filterConditions[filterConditions.length - 1];
      if (newCondition) {
        onUpdateFilterCondition(newCondition.id, {
          type: 'Methodology',
          value: methodology
        });
      }
    }
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
    const incompleteFilters = filterConditions.filter(condition => {
      if (!condition.type || !condition.value) return true;
      if (condition.type === 'Criteria') {
        return !condition.value || !condition.operator || condition.rating === undefined;
      }
      return false;
    });

    if (incompleteFilters.length > 0) {
      setIncompleteFilterId('all');
      setTimeout(() => setIncompleteFilterId(null), 3000);
      return;
    }

    setIsSettingsOpen(false);
  };

  const showRemovedToolsMenu = removedTools.length > 0;

  React.useEffect(() => {
    const methodologyFilters = new Set(
      filterConditions.filter(c => c.type === 'Methodology' && c.value).map(c => c.value)
    );
    setActiveMethodologies(methodologyFilters);
  }, [filterConditions]);

  const renderTool = (tool: Tool) => (
    <DraggableItem key={tool.id} id={tool.id}>
      <div className="pl-8">
        <ToolCard
          tool={tool}
          selectedTools={selectedTools}
          onRemove={onToolRemove}
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

        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <div className="flex items-center">
            <div className="flex items-center">
              <Layout className="w-6 h-6 mr-2 text-alpine-blue-500" />
              <div className="flex items-center">
                <h2 className="text-xl font-bold">Tools</h2>
                <span className="hidden lg:block ml-2 text-sm text-gray-500">
                  {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleMethodologyClick('Waterfall')}
              className={`px-3 py-1 text-sm rounded-full transition-all duration-150 focus:outline-none border shadow-sm ${
                filterConditions.some(c => c.type === 'Methodology' && c.value === 'Waterfall')
                  ? 'bg-alpine-blue-500 text-white hover:bg-alpine-blue-600 border-transparent'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              Waterfall
            </button>
            <button
              onClick={() => handleMethodologyClick('Agile')}
              className={`px-3 py-1 text-sm rounded-full transition-all duration-150 focus:outline-none border shadow-sm ${
                filterConditions.some(c => c.type === 'Methodology' && c.value === 'Agile')
                  ? 'bg-alpine-blue-500 text-white hover:bg-alpine-blue-600 border-transparent'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              Agile
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => {
                  if (isSettingsOpen) {
                    handleSettingsClose();
                  } else {
                    setIsSettingsOpen(true);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              {isSettingsOpen && (
                <div className="settings-overlay">
                  <div className="fixed inset-0" onClick={handleSettingsClose} />
                  <div className="settings-content">
                    <div className="flex items-center justify-between p-3 border-b">
                      <div>
                        <h3 className="font-medium">Tool Settings</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} visible
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
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b">
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

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
                      Compare and evaluate tools based on your specific needs:
                    </p>
                    <ul className="space-y-2 pl-4">
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Methodology:</span>
                        <span>Use Waterfall/Agile buttons to quickly filter tools by development approach</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Filters:</span>
                        <span>Access advanced filters through settings (⚙️) to refine by function, criteria scores, and more</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium text-gray-900 mr-2">Tool Cards:</span>
                        <span>Expand cards to view detailed ratings and feature explanations</span>
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500 italic">
                      Removed tools can be restored through the settings menu
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`p-6 ${!isFullscreen && 'section-scroll'}`}>
          <div className="pt-6 space-y-4">
            <DraggableList
              items={selectedTools}
              onReorder={onToolsReorder}
              renderItem={renderTool}
              getItemId={(tool) => tool.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};