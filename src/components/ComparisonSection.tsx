import React from 'react';
import { Boxes } from 'lucide-react';
import { Tool, Criterion } from '../types';
import { ComparisonChart } from './ComparisonChart';
import { useFullscreen } from '../contexts/FullscreenContext';
import { EnhancedRecommendationSection } from './EnhancedRecommendationSection';

interface ComparisonSectionProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { fullscreenView, isMobile } = useFullscreen();

  // For mobile, check the fullscreen view. For desktop, show both
  const shouldShowRecommendations = isMobile ? fullscreenView === 'recommendations' : false;
  const shouldShowChart = isMobile ? fullscreenView === 'chart' : true;

  if (shouldShowRecommendations) {
    return (
      <EnhancedRecommendationSection
        selectedTools={selectedTools}
        selectedCriteria={selectedCriteria}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart Section */}
      {shouldShowChart && (
        <div className="bg-white rounded-lg shadow-lg flex flex-col">
          <div className="px-6 py-4 border-b bg-alpine-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Boxes className="w-6 h-6 mr-2 text-alpine-blue-500" />
                  <h2 className="text-xl font-bold">Visual Comparison</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0 sm:ml-3">
                  <span className="text-sm text-center text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm w-full sm:w-auto">
                    {selectedCriteria.length} criteria considered
                  </span>
                  <span className="text-sm text-center text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm w-full sm:w-auto">
                    {selectedTools.length} {selectedTools.length === 1 ? 'tool' : 'tools'} analyzed
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white border-b">
            <img 
              src="https://app.onecal.io/b/matt-wagner/schedule-a-meeting-with-matt/avatar" 
              alt="Software Advisor" 
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-midnight-800">Want software advice from the experts?</h3>
              <p className="text-gray-600 mt-1">Get free help from our project management software advisors to find your match.</p>
            </div>
            <a 
              href="https://app.onecal.io/b/matt-wagner/schedule-a-meeting-with-matt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Free Advice
            </a>
          </div>
          <div className="flex flex-col h-full">
            <div id="comparison-chart" className="flex-1 w-full relative">
              <ComparisonChart
                selectedTools={selectedTools}
                selectedCriteria={selectedCriteria}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Recommendations Section for Desktop */}
      {!isMobile && (
        <EnhancedRecommendationSection
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
        />
      )}
    </div>
  );
};