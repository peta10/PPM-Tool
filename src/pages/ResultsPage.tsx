import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StepsSection } from '@/components/layout/StepsSection';
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{excellentMatches}</div>
              <div className="text-sm text-green-700">Excellent Matches</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{goodMatches}</div>
              <div className="text-sm text-blue-700">Good Matches</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{selectedTools.length}</div>
              <div className="text-sm text-purple-700">Tools Analyzed</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{selectedCriteria.length}</div>
              <div className="text-sm text-orange-700">Criteria Evaluated</div>
            </div>
          </div>
          
          {/* Top Recommendation */}
          {topTool && (
            <div className="bg-gradient-to-r from-alpine-blue-50 to-alpine-blue-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-alpine-blue-800 mb-2">
                🏆 Top Recommendation: {topTool.name}
              </h3>
              <p className="text-alpine-blue-700 text-sm">
                With a match score of {calculateScore(topTool).toFixed(1)}/10, this tool best aligns with your requirements and priorities.
              </p>
            </div>
          )}
          
          {/* Download Report Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowEmailModal(true)}
              disabled={isGeneratingPDF}
              className="flex items-center px-8 py-3 bg-alpine-blue-500 hover:bg-alpine-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm text-lg"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 w-5 h-5" />
                  Download Detailed Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        <EnhancedRecommendationSection
          selectedTools={selectedTools}
          selectedCriteria={selectedCriteria}
        />
      </main>
      
      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        isLoading={isGeneratingPDF}
      />
    </div>
  );
}; 