import React from 'react';
import { Tool, Criterion } from '../types';
import { RecommendationTooltip } from './RecommendationTooltip';
import { Award, Maximize2, Minimize2, LineChart, ChevronDown, ChevronUp, AlertTriangle, ArrowRight, Download, Boxes } from 'lucide-react';
import { useFullscreen } from '../contexts/FullscreenContext';
import { FullscreenNavigation } from './FullscreenNavigation';
import { Header } from './Header';
import { StepsSection } from './StepsSection';

interface RecommendationSectionProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
  onExportPDF?: () => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  selectedTools,
  selectedCriteria,
  onExportPDF,
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const isFullscreen = fullscreenView === 'recommendations';
  const [isScoreInfoOpen, setIsScoreInfoOpen] = React.useState(false);
  const [expandedTools, setExpandedTools] = React.useState<Set<string>>(new Set());

  const toggleToolExpansion = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  const calculateScore = (tool: Tool) => {
    let totalScore = 0;
    let meetsAllCriteria = true;

    selectedCriteria.forEach((criterion) => {
      // Check if the criterion exists in the tool's criteria array
      const criterionData = tool.criteria.find(
        (c) => c.id === criterion.id || c.name === criterion.name
      );
      
      // Get tool rating, defaulting to the ratings object if not found in criteria array
      const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
      const userRating = criterion.userRating;

      // Check if tool meets or exceeds requirement
      if (toolRating < userRating) {
        meetsAllCriteria = false;
      }

      // Calculate score based on how well tool meets requirements
      if (toolRating >= userRating) {
        // Tool meets/exceeds requirement - score based on how much it exceeds
        const excess = Math.min(toolRating - userRating, 2); // Cap excess points at 2
        totalScore += 8 + excess; // Base 8 points + up to 2 bonus points
      } else {
        // Tool falls short - score drops more sharply
        const shortfall = userRating - toolRating;
        totalScore += Math.max(0, 7 - shortfall * 2); // Steeper penalty for not meeting requirements
      }
    });

    // Calculate average score
    let finalScore = totalScore / selectedCriteria.length;

    // If tool meets or exceeds ALL criteria, it gets a perfect 10
    if (meetsAllCriteria) {
      finalScore = 10;
    }

    return finalScore;
  };

  const sortedTools = [...selectedTools].sort(
    (a, b) => calculateScore(b) - calculateScore(a)
  );

  const content = (
    <>
      <div className="flex items-center justify-between p-6 pb-4 border-b">
        <div className="flex items-center">
          <div className="flex items-center">
            <Award className="w-6 h-6 mr-2 text-alpine-blue-500" />
            <h2 className="text-lg font-semibold">Recommendations</h2>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <FullscreenNavigation />
          {!isMobile && (
            <button
              onClick={() => toggleFullscreen('recommendations')}
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

      <div className="border-b bg-gray-50">
        <div className="px-6">
          <div className="relative">
            <button
              onClick={() => setIsScoreInfoOpen(!isScoreInfoOpen)}
              className="w-full flex items-center justify-between py-3 text-left group"
            >
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                Match Score Instructions
              </span>
              {isScoreInfoOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              )}
            </button>
            {isScoreInfoOpen && (
              <div className="py-3">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    Tools are scored based on how well they meet your
                    requirements:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">Perfect 10:</span>
                      <span>Tool meets or exceeds all your requirements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">8-9:</span>
                      <span>Tool mostly meets requirements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">0-7:</span>
                      <span>Falls below requirements</span>
                    </li>
                  </ul>
                  <p className="text-xs mt-2">
                    Scores are weighted by your criteria importance rankings
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        id="recommendation-content"
        className={`px-6 py-6 space-y-4 ${
          !isFullscreen && 'h-[calc(100vh-8rem)] overflow-y-auto section-scroll'
        }`}
      >
        {sortedTools.map((tool, index) => (
          <div
            key={`recommendation-${tool.id}-${index}`}
            className="rounded-lg bg-gray-50"
          >
            <div className="p-4">
              <button
                onClick={() => toggleToolExpansion(tool.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{tool.name}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          calculateScore(tool) >= 8
                            ? 'text-green-600' // Good match (8-10)
                            : calculateScore(tool) >= 6
                            ? 'text-alpine-blue-500' // Moderate match (6-7.9)
                            : 'text-gray-600' // Poor match (below 6)
                        }`}
                      >
                        {calculateScore(tool).toFixed(1)}/10
                      </div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                    {expandedTools.has(tool.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
            </div>
            {expandedTools.has(tool.id) && (
              <div className="border-t px-4 py-3 space-y-3 bg-white/50 rounded-b-lg">
                <h4 className="font-medium text-gray-900">Score Breakdown</h4>
                <div className="space-y-2">
                  {selectedCriteria.map((criterion) => {
                    // Find the criterion in the tool's criteria array
                    const criterionData = tool.criteria.find(
                      (c) => c.id === criterion.id || c.name === criterion.name
                    );
                    
                    // Get tool rating, defaulting to the ratings object if not found in criteria array
                    const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
                    const userRating = criterion.userRating;

                    return (
                      <div key={criterion.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {criterion.name}
                          </span>
                        </div>
                        <div className="text-gray-500 space-x-2 text-xs mt-0.5">
                          <span>Your Ranking: {userRating}/5</span>
                          <span>•</span>
                          <span>Tool Ranking: {toolRating}/5</span>
                          <span>•</span>
                          <span>
                            {toolRating > userRating
                              ? 'Exceeds your ranking'
                              : toolRating === userRating
                              ? 'Meets your ranking'
                              : `Below by ${userRating - toolRating}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        <div className="group relative text-xs text-gray-500 mt-8 sm:mt-12 lg:mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p>
                <strong>Disclaimer:</strong> The recommendations and match
                scores provided are for informational purposes only and do not
                constitute professional advice. Additional details shown upon
                hover.
              </p>
            </div>
          </div>
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50">
            <div className="space-y-2">
              <p className="font-medium mb-1">The information is:</p>
              <ul className="space-y-1 text-gray-300">
                <li>
                  • Based on user-provided criteria, publicly available
                  information & independent research
                </li>
                <li>• Generated through an automated scoring system</li>
                <li>• Not a guarantee of product performance or suitability</li>
                <li>• Subject to change without notice</li>
              </ul>
              <p className="font-medium mb-1">
                Tool rankings and features may vary based on version,
                implementation, and specific use cases. Users should:
              </p>
              <ul className="space-y-1 text-gray-300">
                <li>• Conduct their own due diligence</li>
                <li>• Test tools in their specific environment</li>
                <li>• Consult with vendors for current specifications</li>
                <li>• Consider professional advice for critical decisions</li>
              </ul>
            </div>
            <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex flex-col h-full overflow-y-auto">
          <Header />
          <StepsSection />

          <div className="flex items-center justify-between p-6 pb-4 border-b bg-white">
            <div className="flex items-center">
              <Award className="w-6 h-6 mr-2 text-alpine-blue-500" />
              <h2 className="text-xl font-bold">Recommendations</h2>
              <p className="hidden lg:block text-sm text-gray-500 ml-2">
                {selectedCriteria.length} criteria considered •{' '}
                {selectedTools.length}{' '}
                {selectedTools.length === 1 ? 'tool' : 'tools'} analyzed
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <FullscreenNavigation />
              {!isMobile && (
                <button
                  onClick={() => toggleFullscreen('recommendations')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border-b">
            <div className="px-6">
              <div className="relative">
                <button
                  onClick={() => setIsScoreInfoOpen(!isScoreInfoOpen)}
                  className="w-full flex items-center justify-between py-3 text-left group"
                >
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    Match Score Instructions
                  </span>
                  {isScoreInfoOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  )}
                </button>
                {isScoreInfoOpen && (
                  <div className="py-3">
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Tools are ranked based on how well they meet your
                        requirements:
                      </p>
                      <p>For each criterion:</p>
                      <ul className="space-y-2 pl-4">
                        <li className="flex items-start">
                          <span className="text-gray-900 mr-2">
                            If tool ranking ≥ your ranking:
                          </span>
                          <span>10/10</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-gray-900 mr-2">
                            If tool ranking &lt; your ranking:
                          </span>
                          <span>10 - (your ranking - tool ranking)</span>
                        </li>
                      </ul>
                                              <div className="mt-2 p-2 bg-white/50 rounded border border-alpine-blue-100">
                        <p className="font-medium text-gray-900 mb-1">
                          Examples:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-900 mb-1">
                              Example 1: Exceeds
                            </p>
                            <ul className="text-xs space-y-0.5">
                              <li>Your Requirement: 4/5</li>
                              <li>Tool Rating: 5/5</li>
                              <li className="font-medium text-green-600">
                                Score: 9/10
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900 mb-1">
                              Example 2: Below
                            </p>
                            <ul className="text-xs space-y-0.5">
                              <li>Your Requirement: 4/5</li>
                              <li>Tool Rating: 2/5</li>
                              <li className="font-medium text-alpine-blue-500">
                                Score: 3.5/10
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs">
                        Final Match Score = Weighted average based on your
                        criteria importance ratings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-alpine-blue-50 border-b border-alpine-blue-100 px-6 py-4 mt-4">
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
                    <span className="mr-1">
                      Learn more about our evaluation service and get a
                      comprehensive analysis from our experts
                    </span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col">
              <div id="recommendation-content" className="space-y-4 px-6 py-6">
                {sortedTools.map((tool, index) => (
                  <div
                    key={`recommendation-${tool.id}-${index}`}
                    className="rounded-lg bg-gray-50"
                  >
                    <div className="p-4">
                      <button
                        onClick={() => toggleToolExpansion(tool.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {tool.name}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div
                                className={`text-xl font-bold ${
                                  calculateScore(tool) >= 8
                                    ? 'text-green-600'
                                    : calculateScore(tool) >= 6
                                    ? 'text-alpine-blue-500'
                                    : 'text-gray-600'
                                }`}
                              >
                                {calculateScore(tool).toFixed(1)}/10
                              </div>
                            </div>
                            {expandedTools.has(tool.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                    {expandedTools.has(tool.id) && (
                      <div className="border-t px-4 py-3 space-y-3 bg-white/50 rounded-b-lg">
                        <h4 className="font-medium text-gray-900">
                          Score Breakdown
                        </h4>
                        <div className="space-y-2">
                          {selectedCriteria.map((criterion) => {
                            // Find the criterion in the tool's criteria array
                            const criterionData = tool.criteria.find(
                              (c) => c.id === criterion.id || c.name === criterion.name
                            );
                            
                            // Get tool rating, defaulting to the ratings object if not found in criteria array
                            const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
                            const userRating = criterion.userRating;

                            return (
                              <div key={criterion.id} className="text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">
                                    {criterion.name}
                                  </span>
                                </div>
                                <div className="text-gray-500 space-x-2 text-xs mt-0.5">
                                  <span>Your Ranking: {userRating}/5</span>
                                  <span>•</span>
                                  <span>Tool Ranking: {toolRating}/5</span>
                                  <span>•</span>
                                  <span>
                                    {toolRating > userRating
                                      ? 'Exceeds your ranking'
                                      : toolRating === userRating
                                      ? 'Meets your ranking'
                                      : `Below by ${userRating - toolRating}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pb-4">
                <div className="group relative text-xs text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p>
                        <strong>Disclaimer:</strong> The recommendations and
                        match scores provided are for informational purposes
                        only and do not constitute professional advice.
                        Additional details shown upon hover.
                      </p>
                    </div>
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50">
                    <div className="space-y-2">
                      <p className="font-medium mb-1">The information is:</p>
                      <ul className="space-y-1 text-gray-300">
                        <li>
                          • Based on user-provided criteria, publicly available
                          information & independent research
                        </li>
                        <li>• Generated through an automated scoring system</li>
                        <li>
                          • Not a guarantee of product performance or
                          suitability
                        </li>
                        <li>• Subject to change without notice</li>
                      </ul>
                      <p className="font-medium mb-1">
                        Tool rankings and features may vary based on version,
                        implementation, and specific use cases. Users should:
                      </p>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Conduct their own due diligence</li>
                        <li>• Test tools in their specific environment</li>
                        <li>
                          • Consult with vendors for current specifications
                        </li>
                        <li>
                          • Consider professional advice for critical decisions
                        </li>
                      </ul>
                    </div>
                    <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="recommendations-section"
      className={`bg-white rounded-lg shadow-lg flex flex-col ${
        isFullscreen ? 'fullscreen-container' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        {isFullscreen && !isMobile && (
          <div className="flex-shrink-0">
            <Header />
            <StepsSection />
          </div>
        )}

        {isFullscreen && isMobile && (
          <div className="flex-shrink-0">
            <div className="p-4 bg-white border-b">
              <h1 className="text-xl font-bold text-gray-900">
                Review Recommendations
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                See tool rankings and detailed analysis
              </p>
            </div>
          </div>
        )}
        {content}
      </div>
    </div>
  );
};