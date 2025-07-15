import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Tool, Criterion } from '../../shared/types';
import {
  Maximize2,
  Minimize2,
  EyeOff,
  LineChart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { ChartControls } from './ChartControls';
import { getToolColor } from '../../shared/utils/chartColors';
import { useFullscreen } from '../../shared/contexts/FullscreenContext';
import { useSteps } from '../../shared/contexts/StepContext';
import { Header } from '../layout/Header';
import { StepsSection } from '../layout/StepsSection';

interface ComparisonChartProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
}

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const { setCurrentStep, markStepComplete } = useSteps();
  const isFullscreen = fullscreenView === 'chart';
  const [instructionsCollapsed, setInstructionsCollapsed] =
    React.useState(true);
  const [visibleCriteria, setVisibleCriteria] = useState<Set<string>>(
    new Set(selectedCriteria.map((c) => c.id))
  );

  // Update visible criteria when selected criteria changes
  React.useEffect(() => {
    setVisibleCriteria(new Set(selectedCriteria.map((c) => c.id)));
  }, [selectedCriteria]);

  // Initialize with requirements visible, but no tool visible by default
  const [visibleTools, setVisibleTools] = useState<Set<string>>(() => {
    const tools = new Set(['requirements']);
    return tools;
  });

  const handleToggleTool = (toolId: string) => {
    const newVisible = new Set(visibleTools);
    if (newVisible.has(toolId)) {
      newVisible.delete(toolId);
    } else {
      newVisible.add(toolId);
    }
    setVisibleTools(newVisible);
  };

  const handleToggleCriterion = (criterionId: string) => {
    const newVisible = new Set(visibleCriteria);
    // Check if hiding would result in less than 3 visible criteria
    if (newVisible.has(criterionId) && newVisible.size <= 3) {
      return; // Don't allow hiding if it would result in less than 3 criteria
    } else if (newVisible.has(criterionId)) {
      newVisible.delete(criterionId);
    } else {
      newVisible.add(criterionId);
    }
    setVisibleCriteria(newVisible);
  };

  const handleToggleAllTools = (visible: boolean) => {
    // Always keep 'requirements' (Your Tool) visible
    const tools = new Set(['requirements']);
    // Add or remove other tools based on the visible parameter
    if (visible) {
      selectedTools.forEach((tool) => tools.add(tool.id));
    }
    setVisibleTools(tools);
  };

  const handleToggleAllCriteria = (visible: boolean) => {
    // Don't allow hiding all criteria
    if (!visible) {
      return;
    }
    setVisibleCriteria(new Set(selectedCriteria.map((c) => c.id)));
  };

  // Enhanced function to get tool rating for a criterion
  const getToolRating = (tool: Tool, criterion: Criterion): number => {
    try {
      // First try to find the criterion in the tool's criteria array by ID
      if (Array.isArray(tool.criteria)) {
        const criterionDataById = tool.criteria.find(c => 
          c.id === criterion.id
        );
        if (criterionDataById && typeof criterionDataById.ranking === 'number') {
          return criterionDataById.ranking;
        }
        
        // Or by name
        const criterionDataByName = tool.criteria.find(c => 
          c.name === criterion.name
        );
        if (criterionDataByName && typeof criterionDataByName.ranking === 'number') {
          return criterionDataByName.ranking;
        }
        
        // Case-insensitive name match as a fallback
        const criterionByLowerName = tool.criteria.find(c => 
          c.name && criterion.name && 
          c.name.toLowerCase() === criterion.name.toLowerCase()
        );
        if (criterionByLowerName && typeof criterionByLowerName.ranking === 'number') {
          return criterionByLowerName.ranking;
        }
      }

      // Next try to get rating from ratings object using criterion ID
      if (tool.ratings && typeof tool.ratings[criterion.id] === 'number') {
        return tool.ratings[criterion.id];
      }
      
      // Special case for specific criterion IDs in the rating object
      const criterionMappings: Record<string, string[]> = {
        'scalability': ['Scalability', 'scalability'],
        'integrations': ['Integrations & Extensibility', 'integrations', 'Integrations'],
        'easeOfUse': ['Ease of Use', 'easeOfUse', 'ease_of_use', 'ease-of-use'],
        'flexibility': ['Flexibility & Customization', 'flexibility', 'customization'],
        'ppmFeatures': ['Project Portfolio Management', 'ppmFeatures', 'ppm_features', 'ppm'],
        'reporting': ['Reporting & Analytics', 'reporting', 'analytics'],
        'security': ['Security & Compliance', 'security', 'compliance']
      };
      
      // Try all possible criterion keys
      const possibleKeys = criterionMappings[criterion.id] || [criterion.name, criterion.id];
      
      for (const key of possibleKeys) {
        if (tool.ratings && typeof tool.ratings[key] === 'number') {
          return tool.ratings[key];
        }
      }
      
      // Check the ratings object with case-insensitive keys
      if (tool.ratings) {
        const criterionNameLower = criterion.name.toLowerCase();
        const matchingKey = Object.keys(tool.ratings).find(key => 
          key.toLowerCase() === criterionNameLower || 
          key.toLowerCase() === criterion.id.toLowerCase()
        );
        
        if (matchingKey && typeof tool.ratings[matchingKey] === 'number') {
          return tool.ratings[matchingKey];
        }
      }

      // Default to 0 if not found
      return 0;
    } catch (error) {
      console.error(`Error getting rating for criterion ${criterion.name}:`, error);
      return 0;
    }
  };

  // Filter criteria to only those that are visible
  const visibleCriteriaList = selectedCriteria.filter(c => visibleCriteria.has(c.id));

  // Prepare datasets for the chart
  const datasets = [];
  
  // Add requirements dataset if visible
  if (visibleTools.has('requirements')) {
    datasets.push({
      label: 'Your Tool',
      data: visibleCriteriaList.map((c) => c.userRating),
      backgroundColor: 'rgba(34, 197, 94, 0.25)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 3,
      borderDash: [5, 5],
    });
  }
  
  // Add datasets for visible tools
  selectedTools.forEach((tool, index) => {
    if (visibleTools.has(tool.id)) {
      const [backgroundColor, borderColor] = getToolColor(index);
      
      // Use getToolRating for each criterion to ensure consistent data access
      const toolData = visibleCriteriaList.map((criterion) => getToolRating(tool, criterion));
      
      datasets.push({
        label: tool.name,
        data: toolData,
        backgroundColor,
        borderColor,
        borderWidth: 2,
      });
    }
  });

  const data = {
    labels: visibleCriteriaList.map((c) => c.name),
    datasets
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: TooltipItem<'radar'>[]) => {
            const criterionName = context[0].label;
            const toolName = context[0].dataset.label || '';
            const isRequirements = toolName === 'Your Tool';
            return `${criterionName} - ${toolName}${
              isRequirements ? ' (Your Ranking)' : ' (Tool Ranking)'
            }`;
          },
          label: (context: TooltipItem<'radar'>) => {
            const label = context.dataset.label || '';
            const value = typeof context.raw === 'number' ? context.raw : 0;
            return label === 'Your Tool'
              ? `Your Ranking: ${value}/5`
              : `Tool Ranking: ${value}/5${
                  value >= 5 ? ' (Exceeds Your Ranking)' : ''
                }`;
          },
        },
      },
    },
    scales: {
      r: {
        angleLines: { display: true },
        pointLabels: {
          display: true,
          font: {
            size: isFullscreen ? 12 : 11,
          },
          padding: isFullscreen ? 25 : 20,
          callback: function (value: string) {
            // Better text wrapping for both mobile and fullscreen
            const maxLength = isFullscreen ? 15 : (window.innerWidth < 1024 ? 12 : 15);
            if (value.length > maxLength) {
              const words = value.split(' ');
              const lines: string[] = [];
              let currentLine = '';

              words.forEach((word) => {
                if (currentLine.length + word.length > maxLength) {
                  if (currentLine) lines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine += (currentLine.length === 0 ? '' : ' ') + word;
                }
              });
              if (currentLine.length > 0) {
                lines.push(currentLine);
              }
              return lines;
            }
            return value;
          },
        },
        min: 0,
        max: 5,
        ticks: {
          display: false,
          stepSize: 1,
          beginAtZero: true,
          precision: 0,
        },
        grid: {
          circular: false,
          lineWidth: 1,
        },
      },
    },
  };

  const content = (
    <>
      <div className="flex items-center justify-between p-6 pb-4 border-b">
        <div className="flex items-center">
          <LineChart className="w-6 h-6 mr-2 text-indigo-600" />
          <h2 className="text-lg font-semibold">Tools - Criteria Comparison</h2>
        </div>
        <div className="flex items-center space-x-2">
          <ChartControls
            selectedTools={selectedTools}
            selectedCriteria={selectedCriteria}
            visibleTools={visibleTools}
            visibleCriteria={visibleCriteria}
            onToggleTool={handleToggleTool}
            onToggleCriterion={handleToggleCriterion}
            onToggleAllTools={handleToggleAllTools}
            onToggleAllCriteria={handleToggleAllCriteria}
            onMinimize={() => toggleFullscreen('chart')}
          />
          {!isMobile && (
            <button
              onClick={() => toggleFullscreen('chart')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-gray-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
          <button
            onClick={() => {
              // Mark chart step as complete
              markStepComplete('chart');
              
              if (isMobile) {
                toggleFullscreen('recommendations');
              } else {
                // Navigate to recommendations step on desktop
                setCurrentStep('recommendations');
              }
            }}
            className="flex items-center px-4 py-2 bg-alpine-blue-500 hover:bg-alpine-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
          >
            Continue to Recommendations
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="px-6">
          <div className="relative">
            <button
              onClick={() => setInstructionsCollapsed(!instructionsCollapsed)}
              className="w-full flex items-center justify-between py-3 text-left group"
            >
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                Chart Instructions
              </span>
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
                    Compare tools against your requirements using the radar
                    chart:
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li className="flex items-start">
                      <span className="font-medium text-gray-900 mr-2">
                        Your Tool:
                      </span>
                      <span>
                        Shown as a dashed green line representing your criteria
                        rankings
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-gray-900 mr-2">
                        Tool Lines:
                      </span>
                      <span>
                        Solid colored lines showing how each tool ranks for your
                        criteria
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-gray-900 mr-2">
                        Visibility:
                      </span>
                      <span>
                        Toggle tools and criteria using the buttons above the
                        chart
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-gray-900 mr-2">
                        Details:
                      </span>
                      <span>
                        Hover over points to see exact rankings and comparisons
                      </span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 italic">
                    Use the settings (⚙️) to customize which tools and criteria
                    are displayed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 py-4 justify-center bg-white/90 border-t">
        <button
          key="chart-toggle-requirements"
          onClick={() => handleToggleTool('requirements')}
          className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
        >
          {visibleTools.has('requirements') ? (
            <div className="w-4 h-4 border-2 border-dashed border-green-500 bg-green-100" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">Your Tool</span>
        </button>
        {selectedTools.map((tool, index) => {
          const [backgroundColor, borderColor] = getToolColor(index);
          return (
            <button
              key={`chart-toggle-${tool.id}-${index}`}
              onClick={() => handleToggleTool(tool.id)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              {visibleTools.has(tool.id) ? (
                <div
                  className="w-4 h-4"
                  style={{
                    backgroundColor,
                    borderColor,
                    borderWidth: 2,
                    borderStyle: 'solid',
                  }}
                />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">{tool.name}</span>
            </button>
          );
        })}
      </div>
      <div className="w-full h-[400px] pt-8">
        <Radar data={data} options={options} />
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0">
            <Header />
            <StepsSection />

            <div className="flex items-center justify-between p-6 pb-4 border-b bg-white shadow-sm">
              <div className="flex items-center">
                <LineChart className="w-6 h-6 mr-2 text-indigo-600" />
                <h2 className="text-xl font-bold">Tools - Criteria Comparison</h2>
                <p className="hidden lg:block text-sm text-gray-500 ml-2">
                  {selectedCriteria.length} criteria considered •{' '}
                  {selectedTools.length}{' '}
                  {selectedTools.length === 1 ? 'tool' : 'tools'} analyzed
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ChartControls
                  selectedTools={selectedTools}
                  selectedCriteria={selectedCriteria}
                  visibleTools={visibleTools}
                  visibleCriteria={visibleCriteria}
                  onToggleTool={handleToggleTool}
                  onToggleCriterion={handleToggleCriterion}
                  onToggleAllTools={handleToggleAllTools}
                  onToggleAllCriteria={handleToggleAllCriteria}
                  onMinimize={() => toggleFullscreen('chart')}
                />
                
                {!isMobile && (
                  <button
                    onClick={() => toggleFullscreen('chart')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    // Mark chart step as complete
                    markStepComplete('chart');
                    
                    if (isMobile) {
                      toggleFullscreen('recommendations');
                    } else {
                      // Navigate to recommendations step on desktop
                      setCurrentStep('recommendations');
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-alpine-blue-500 hover:bg-alpine-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
                >
                  Continue to Recommendations
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border-b">
              <div className="px-6">
                <div className="relative">
                  <button
                    onClick={() =>
                      setInstructionsCollapsed(!instructionsCollapsed)
                    }
                    className="w-full flex items-center justify-between py-3 text-left group"
                  >
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                      Chart Instructions
                    </span>
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
                          Compare tools against your requirements using the radar
                          chart:
                        </p>
                        <ul className="space-y-2 pl-4">
                          <li className="flex items-start">
                            <span className="font-medium text-gray-900 mr-2">
                              Your Tool:
                            </span>
                            <span>
                              Shown as a dashed green line representing your
                              criteria rankings
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium text-gray-900 mr-2">
                              Tool Lines:
                            </span>
                            <span>
                              Solid colored lines showing how each tool ranks for
                              your criteria
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium text-gray-900 mr-2">
                              Visibility:
                            </span>
                            <span>
                              Toggle tools and criteria using the buttons above
                              the chart
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium text-gray-900 mr-2">
                              Details:
                            </span>
                            <span>
                              Hover over points to see exact rankings and
                              comparisons
                            </span>
                          </li>
                        </ul>
                        <p className="text-xs text-gray-500 italic">
                          Use the settings (⚙️) to customize which tools and
                          criteria are displayed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable chart content area with proper scroll handling */}
          <div 
            className="flex-1 chart-fullscreen-scroll"
            data-lenis-prevent
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <div className="flex flex-col min-h-full">
              <div className="flex flex-wrap gap-4 py-4 px-4 justify-center bg-white border-b">
                <button
                  key="chart-toggle-requirements"
                  onClick={() => handleToggleTool('requirements')}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  {visibleTools.has('requirements') ? (
                    <div className="w-4 h-4 border-2 border-dashed border-green-500 bg-green-100" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">Your Tool</span>
                </button>
                {selectedTools.map((tool, index) => {
                  const [backgroundColor, borderColor] = getToolColor(index);
                  return (
                    <button
                      key={`chart-toggle-${tool.id}-${index}`}
                      onClick={() => handleToggleTool(tool.id)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      {visibleTools.has(tool.id) ? (
                        <div
                          className="w-4 h-4"
                          style={{
                            backgroundColor,
                            borderColor,
                            borderWidth: 2,
                            borderStyle: 'solid',
                          }}
                        />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Chart container with improved scrolling and padding */}
              <div className="flex-1 p-4 sm:p-6 pb-32 bg-white">
                <div className="w-full min-h-[600px] flex items-center justify-center">
                  <div className="w-full h-full max-w-5xl" style={{ minHeight: '600px' }}>
                    <Radar data={data} options={options} />
                  </div>
                </div>
                {/* Add extra bottom padding to ensure chart labels are fully visible */}
                <div className="h-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="chart-section"
      className={`bg-white rounded-lg shadow-lg flex flex-col h-full ${
        isFullscreen ? 'fullscreen-container' : ''
      }`}
    >
      <div className="flex flex-col h-full flex-1">
        {isFullscreen && !isMobile && (
          <div className="flex-shrink-0">
            <Header />
            <StepsSection />
          </div>
        )}

        {isFullscreen && isMobile && (
          <div className="flex-shrink-0">
            <div className="p-4 bg-white border-b">
              <h1 className="text-xl font-bold text-gray-900">Analyze Chart</h1>
              <p className="text-sm text-gray-500 mt-1">
                Compare tools with radar chart visualization
              </p>
            </div>
          </div>
        )}
        {content}
      </div>
    </div>
  );
};

export default ComparisonChart;