import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ComparisonBannerProps {
  onExportPDF: () => void;
}

export const ComparisonBanner: React.FC<ComparisonBannerProps> = ({
  onExportPDF,
}) => {
  return (
    <div className="bg-alpine-blue-50 border-b border-alpine-blue-100 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* PDF Export functionality hidden but preserved in the code
        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold text-midnight-800">
            Download a report of your comparison & recommendations
          </h3>
          <div className="mt-1.5">
            <button
              onClick={onExportPDF}
              className="inline-flex items-center justify-center px-4 py-2 bg-alpine-blue-500 text-white rounded-lg hover:bg-alpine-blue-600 transition-colors text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Free Report
            </button>
          </div>
        </div>
        */}
        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold text-midnight-800">
            Need a more detailed evaluation?
          </h3>
          <div className="mt-1.5">
            <a 
              href="https://airtable.com/appsuQtcklOHDbcb6/pag1xGs1ZBdeNccC9/form" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-left w-full lg:w-auto inline-flex items-center text-alpine-blue-500 hover:text-alpine-blue-700 text-sm font-medium group"
            >
              <span className="mr-1">Learn more about our evaluation service and get a comprehensive analysis from our experts</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};