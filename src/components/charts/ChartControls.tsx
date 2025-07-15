import React, { useState } from 'react';
import { Settings, X, Eye, EyeOff, ArrowUp } from 'lucide-react';
import { Tool, Criterion } from '@/shared/types';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { highlightElement } from '@/shared/utils/highlightElement';

interface ChartControlsProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
  visibleTools: Set<string>;
  visibleCriteria: Set<string>;
  onToggleTool: (toolId: string) => void;
  onToggleCriterion: (criterionId: string) => void;
  onToggleAllTools: (visible: boolean) => void;
  onToggleAllCriteria: (visible: boolean) => void;
  onMinimize: () => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  selectedTools,
  selectedCriteria,
  visibleTools,
  visibleCriteria,
  onToggleTool,
  onToggleCriterion,
  onToggleAllTools,
  onToggleAllCriteria,
  onMinimize,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const controlsRef = React.useRef<HTMLDivElement>(null);
  const [criterionWithError, setCriterionWithError] = useState<string | null>(null);
  const { fullscreenView, toggleFullscreen } = useFullscreen();

  useClickOutside(controlsRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <div className="relative" ref={controlsRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 hover:bg-gray-100 rounded-lg relative"
        aria-label="Chart settings"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
      
      {isOpen && (
        <div className="settings-overlay">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="settings-content">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">Chart Settings</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Your Tool Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Your Tool</h4>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (fullscreenView === 'none') {
                        highlightElement('criteria-section');
                      } else {
                        toggleFullscreen('none');
                        setTimeout(() => toggleFullscreen('criteria'), 0);
                      }
                    }}
                    className="text-sm text-gray-700 mt-1 mb-3 hover:text-gray-900 transition-colors text-left w-full flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <span className="flex-1">Update your tool criteria rankings from the criteria section</span>
                    <ArrowUp className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => onToggleTool('requirements')}
                className="flex items-center w-full px-3 py-2 rounded hover:bg-gray-50 border-b border-gray-100"
                aria-label={`${visibleTools.has('requirements') ? 'Hide' : 'Show'} Your Tool`}
              >
                              {visibleTools.has('requirements') ? (
                <Eye className="w-4 h-4 mr-2 text-alpine-blue-500" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
              )}
                <span className="text-sm font-medium">Show in comparison</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Criteria Section */}
              <div>
                <div className="mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Criteria</h4>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (fullscreenView === 'none') {
                          highlightElement('criteria-section');
                        } else {
                          toggleFullscreen('none');
                          setTimeout(() => toggleFullscreen('criteria'), 0);
                        }
                      }}
                      className="text-sm text-gray-700 mt-1 mb-3 hover:text-gray-900 transition-colors text-left w-full flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <span className="flex-1">Update criteria options from the criteria section</span>
                      <ArrowUp className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        if (visibleCriteria.size < 3) {
                          setCriterionWithError('all');
                          setTimeout(() => setCriterionWithError(null), 2000);
                          return;
                        }
                        onToggleAllCriteria(true);
                      }}
                      className="text-xs text-alpine-blue-500 hover:text-alpine-blue-700"
                    >
                      Show All
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedCriteria.map((criterion) => (
                    <div key={criterion.id} className="relative">
                      <button
                        onClick={() => {
                          if (visibleCriteria.has(criterion.id) && visibleCriteria.size <= 3) {
                            setCriterionWithError(criterion.id);
                            setTimeout(() => setCriterionWithError(null), 3000);
                            return;
                          }
                          onToggleCriterion(criterion.id);
                        }}
                        className="flex items-center w-full px-3 py-2 rounded hover:bg-gray-50 relative"
                        aria-label={`${visibleCriteria.has(criterion.id) ? 'Hide' : 'Show'} ${criterion.name}`}
                      >
                        {visibleCriteria.has(criterion.id) ? (
                          <Eye className="w-4 h-4 mr-2 text-alpine-blue-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        <span className="text-sm">{criterion.name}</span>
                        {criterionWithError === criterion.id && (
                          <div className="absolute right-0 top-full mt-1 z-10 bg-red-50 text-red-600 text-xs py-1 px-2 rounded border border-red-200 whitespace-nowrap">
                            Minimum 3 criteria required
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Section */}
              <div>
                <div className="mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Tools</h4>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        if (fullscreenView === 'none') {
                          highlightElement('tools-section');
                        } else {
                          toggleFullscreen('none');
                          setTimeout(() => toggleFullscreen('tools'), 0);
                        }
                      }}
                      className="text-sm text-gray-700 mt-1 mb-3 hover:text-gray-900 transition-colors text-left w-full flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <span className="flex-1">Update tool options from the tool section</span>
                      <ArrowUp className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => onToggleAllTools(true)}
                      className="text-xs text-alpine-blue-500 hover:text-alpine-blue-700"
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => onToggleAllTools(false)}
                      className="text-xs text-alpine-blue-500 hover:text-alpine-blue-700"
                    >
                      Hide All
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => onToggleTool(tool.id)}
                      className="flex items-center w-full px-3 py-2 rounded hover:bg-gray-50"
                      aria-label={`${visibleTools.has(tool.id) ? 'Hide' : 'Show'} ${tool.name}`}
                    >
                      {visibleTools.has(tool.id) ? (
                        <Eye className="w-4 h-4 mr-2 text-alpine-blue-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      <span className="text-sm">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};