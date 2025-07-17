import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
import { CTABanner } from '@/components/common/CTABanner';
import { EnhancedRecommendationSection } from '@/features/recommendations/components/EnhancedRecommendationSection';
import { EmailCaptureModal } from '@/components/forms/EmailCaptureModal';
import { Tool, Criterion } from '@/shared/types';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';
import { generateReport } from '@/shared/utils/pdfExport';
import { Download, Trophy, CheckCircle } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

interface ResultsPageProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { isMobile } = useFullscreen();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);

  // Calculate match scores for summary
  const calculateScore = (tool: Tool) => {
    let totalScore = 0;

    selectedCriteria.forEach((criterion) => {
      const criterionData = tool.criteria.find(
        (c) => c.id === criterion.id || c.name === criterion.name
      );
      
      const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
      const userRating = criterion.userRating;

      if (toolRating >= userRating) {
        const excess = Math.min(toolRating - userRating, 2);
        totalScore += 8 + excess;
      } else {
        const shortfall = userRating - toolRating;
        totalScore += Math.max(0, 7 - shortfall * 2);
      }
    });

    return selectedCriteria.length > 0 
      ? (totalScore / selectedCriteria.length) 
      : 0;
  };

  const sortedTools = React.useMemo(() => {
    return [...selectedTools].sort((a, b) => calculateScore(b) - calculateScore(a));
  }, [selectedTools, selectedCriteria]);

  const topTool = sortedTools[0];
  const excellentMatches = sortedTools.filter(tool => calculateScore(tool) >= 8).length;
  const goodMatches = sortedTools.filter(tool => {
    const score = calculateScore(tool);
    return score >= 6 && score < 8;
  }).length;

  // Handle email submission and contact storage
  const handleEmailSubmit = async (email: string) => {
    try {
      setIsGeneratingPDF(true);
      
      // Store contact submission in database
      await supabase
        .from('contact_submissions')
        .insert({
          name: 'PPM Tool Report Request',
          email: email,
          company: 'Unknown',
          message: `Requested PPM tool comparison report for ${selectedTools.length} tools and ${selectedCriteria.length} criteria.`
        });

      // Generate PDF report
      await generateReport(sortedTools, selectedCriteria);
      
      setEmailCaptured(true);
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error processing request:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isMobile ? 'pb-20' : ''}`}>
      <Header />
      <CTABanner />
      <StepsSection />
      
      <main className="container mx-auto px-4 py-8">
        {/* Results Summary Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-midnight-800">Your PPM Tool Analysis Results</h1>
                <p className="text-gray-600">Based on your criteria rankings and tool comparison</p>
              </div>
            </div>
            
            {emailCaptured && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Report Downloaded</span>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-alpine-blue-50 to-alpine-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-alpine-blue-600">{selectedTools.length}</div>
              <div className="text-sm text-alpine-blue-700">Tools Analyzed</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{selectedCriteria.length}</div>
              <div className="text-sm text-green-700">Criteria Evaluated</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{topTool ? 1 : 0}</div>
              <div className="text-sm text-purple-700">Top Recommendations</div>
            </div>
          </div>
          
          {/* Download Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-alpine-blue-50 to-purple-50 rounded-lg border border-alpine-blue-200">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-midnight-800 mb-1">Download Complete Analysis Report</h3>
              <p className="text-gray-600 text-sm">Get detailed insights, comparisons, and next steps in PDF format</p>
            </div>
            <button 
              onClick={() => setShowEmailModal(true)}
              disabled={isGeneratingPDF}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-alpine-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-alpine-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <Download className="w-5 h-5 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>
        
        {/* Enhanced Recommendations */}
        <EnhancedRecommendationSection
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
        />
        
        {/* Email Capture Modal */}
        <EmailCaptureModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSubmit}
          isLoading={isGeneratingPDF}
        />
      </main>
    </div>
  );
}; 