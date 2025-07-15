import React, { useState } from 'react';
import { Criterion } from '../types';
import { Sliders, Plus, Minus, HelpCircle, Settings, Maximize2, Minimize2, X, Boxes, ChevronDown, ChevronUp } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { RemovedCriteriaMenu } from './RemovedCriteriaMenu';
import { DraggableList } from './DraggableList';
import { DraggableItem } from './DraggableItem';
import { useFullscreen } from '../contexts/FullscreenContext';
import { FullscreenNavigation } from './FullscreenNavigation';
import { Header } from './Header';
import { StepsSection } from './StepsSection';
import { GuidedRankingForm } from './GuidedRankingForm';
import { Slider } from './ui/slider';

interface CriteriaSectionProps {
  criteria: Criterion[];
  removedCriteria: Criterion[];
  onRemovedCriteriaChange: (criteria: Criterion[]) => void;
  onCriteriaChange: (criteria: Criterion[]) => void;
  onRemoveCriterion: (criterion: Criterion) => void;
  onRestoreCriterion: (criterion: Criterion) => void;
  onRestoreAll: () => void;
}

export const CriteriaSection: React.FC<CriteriaSectionProps> = ({
  criteria,
  removedCriteria,
  onRemovedCriteriaChange,
  onCriteriaChange,
  onRemoveCriterion,
  onRestoreCriterion,
  onRestoreAll,
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const isFullscreen = fullscreenView === 'criteria';
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const [criterionWithError, setCriterionWithError] = React.useState<string | null>(null);
  const [isGuidedFormOpen, setIsGuidedFormOpen] = React.useState(false);

  useClickOutside(settingsRef, () => setIsSettingsOpen(false));

  const handleResetCriteria = () => {
    onRestoreAll();
    // Reset all criteria ratings to 3
    const updatedCriteria = criteria.map(criterion => ({
      ...criterion,
      userRating: 3
    }));
    onCriteriaChange(updatedCriteria);
    setIsSettingsOpen(false);
  };

  const handleRatingChange = (id: string, value: number) => {
    const updatedCriteria = criteria.map(criterion =>
      criterion.id === id ? { ...criterion, userRating: value } : criterion
    );
    onCriteriaChange(updatedCriteria);
  };

  const handleUpdateRankings = (rankings: { [key: string]: number }) => {
    const updatedCriteria = criteria.map(criterion => ({
      ...criterion,
      userRating: rankings[criterion.id] || criterion.userRating
    }));
    onCriteriaChange(updatedCriteria);
  };

  const renderCriterion = (criterion: Criterion) => (
    <div className="border-b pb-4 pl-8">
      <div className="flex items-center justify-between mb-2 relative">
        <div className="flex items-center">
          <span className="font-medium">{criterion.name}</span>
          <div className="group relative ml-2">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="hidden group-hover:block fixed z-[9999] w-64 max-w-[calc(100vw-8rem)] p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg transform -translate-y-full -translate-x-4 -mt-2">
              <p>{criterion.description}</p>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-300">Rating: 1/5</p>
                  <p className="text-xs text-gray-400">{criterion.ratingDescriptions.low}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-300">Rating: 5/5</p>
                  <p className="text-xs text-gray-400">{criterion.ratingDescriptions.high}</p>
                </div>
              </div>
              <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 bottom-[-4px] left-6"></div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (criteria.length <= 3) {
              setCriterionWithError(criterion.id);
              setTimeout(() => setCriterionWithError(null), 2000);
              return;
            }
            onRemoveCriterion(criterion);
          }}
          className="text-red-500 hover:text-red-700 relative"
        >
          <Minus className="w-4 h-4" />
          {criterionWithError === criterion.id && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-red-50 text-red-600 text-xs py-1 px-2 rounded border border-red-200 whitespace-nowrap">
              Minimum 3 criteria required
            </div>
          )}
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <Slider
          value={[criterion.userRating]}
          onValueChange={(values) => handleRatingChange(criterion.id, values[0])}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <span className={`w-8 text-center font-medium ${
          criterion.userRating >= 4 ? 'text-green-600' :  // Critical requirement (4-5)
                      criterion.userRating >= 2 ? 'text-alpine-blue-500' :   // Important feature (2-3)
          'text-gray-600'                                 // Nice to have (1)
        }`}>{criterion.userRating}</span>
      </div>
    </div>
  );
  return (
    <div id="criteria-section" className={`bg-white rounded-lg shadow-lg flex flex-col ${isFullscreen ? 'fullscreen-container' : ''}`}>
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
          <Sliders className="w-6 h-6 mr-2 text-alpine-blue-500" />
          <h2 className="text-xl font-bold text-midnight-800">Criteria</h2>
          <span className="hidden lg:block ml-2 text-sm text-midnight-400">
            {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'}
          </span>
          <button
            className="ml-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-alpine-blue-500 bg-alpine-blue-50 hover:bg-alpine-blue-100 rounded-lg transition-colors"
            onClick={() => setIsGuidedFormOpen(true)}
          >
            Guided Rankings
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-alpine-blue-100 text-alpine-blue-700 rounded">BETA</span>
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            
            {isSettingsOpen && (
              <div className="settings-overlay">
                <div className="fixed inset-0" onClick={() => setIsSettingsOpen(false)} />
                <div className="settings-content">
                <div className="flex items-center justify-between p-3 border-b">
                  <div>
                    <h3 className="font-medium">Criteria Settings</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'} visible
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleResetCriteria}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-alpine-blue-500 hover:bg-alpine-blue-600 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {removedCriteria.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                          {removedCriteria.length} {removedCriteria.length === 1 ? 'criterion' : 'criteria'} removed
                          <button
                            onClick={onRestoreAll}
                            className="ml-2 text-sm text-alpine-blue-500 hover:text-alpine-blue-700"
                          >
                            Add Back All
                          </button>
                        </span>
                      </div>
                      <RemovedCriteriaMenu
                        removedCriteria={removedCriteria}
                        onRestore={onRestoreCriterion}
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
              onClick={() => toggleFullscreen('criteria')}
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

      <div className="flex-shrink-0 border-b bg-gray-50">
        <div className="px-6">
          <div className="relative">
            <button
              onClick={() => setInstructionsCollapsed(!instructionsCollapsed)}
              className="w-full flex items-center justify-between py-3 text-left group"
            >
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Criteria Instructions</span>
              {instructionsCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              )}
            </button>
            {!instructionsCollapsed && (
              <div className="py-3">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>Two ways to rank your criteria:</p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">1. Guided Ranking (beta)</h4>
                      <p className="text-gray-600">
                        Answer 10 questions about your needs to automatically determine optimal rankings.
                        Click the "Guided Rankings" button above to start.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">2. Manual Ranking</h4>
                      <p className="text-gray-600 mb-2">
                        Directly set importance levels using the sliders below (1-5 scale). Use the help icon (?) next to each criterion for detailed descriptions and examples.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div 
        className={`p-6 ${!isFullscreen && 'section-scroll'}`}
        data-lenis-prevent={!isFullscreen}
      >
        <DraggableList
          items={criteria}
          onReorder={onCriteriaChange}
          renderItem={renderCriterion}
          getItemId={(criterion) => criterion.id}
        />
      </div>
      
      <GuidedRankingForm
        isOpen={isGuidedFormOpen}
        onClose={() => setIsGuidedFormOpen(false)}
        criteria={criteria}
        onUpdateRankings={handleUpdateRankings}
      />
      </div>
    </div>
  );
};