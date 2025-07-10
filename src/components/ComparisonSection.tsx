import React from 'react';
import { Tool, Criterion } from '../types';
import { RecommendationSection } from './RecommendationSection';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonBanner } from './ComparisonBanner';
import { generateReport } from '../utils/pdfExport';
import { LineChart, Boxes, ChevronDown, ChevronUp } from 'lucide-react';
import { useFullscreen } from '../contexts/FullscreenContext';

interface ComparisonSectionProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const [instructionsCollapsed, setInstructionsCollapsed] = React.useState(true);
  const exportToPDF = async () => {
    try {
      await generateReport(selectedTools, selectedCriteria);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col mb-8">
      <div className="px-6 py-4 border-b bg-alpine-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Boxes className="w-6 h-6 mr-2 text-alpine-blue-500" />
              <h2 className="text-xl font-bold">Tool Finder Results</h2>
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
      <ComparisonBanner onExportPDF={exportToPDF} />
      <div className="flex flex-col lg:grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x h-full">
        <div className="flex flex-col h-full">
          <div id="comparison-chart" className="flex-1 w-full relative">
            <ComparisonChart
              selectedTools={selectedTools}
              selectedCriteria={selectedCriteria}
              onExportPDF={exportToPDF}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="h-full">
            <RecommendationSection
              selectedTools={selectedTools}
              selectedCriteria={selectedCriteria}
              onExportPDF={exportToPDF}
            />
          </div>
        </div>
      </div>
    </div>
  );
};