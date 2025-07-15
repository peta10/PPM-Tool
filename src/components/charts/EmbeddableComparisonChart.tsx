import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Tool, Criterion } from '../types';
import {
  Maximize2,
  Minimize2,
  EyeOff,
  LineChart,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { getToolColor } from '../utils/chartColors';
import { useFullscreen } from '../contexts/FullscreenContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface EmbeddableComparisonChartProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
  onExportPDF?: () => void;
  height?: number;
  showHeader?: boolean;
  compactMode?: boolean;
}

// Lazy load the radar chart component
const LazyRadarChart = React.lazy(() => import('./comparison/ChartContainer'));

export const EmbeddableComparisonChart: React.FC<EmbeddableComparisonChartProps> = ({
  selectedTools,
  selectedCriteria,
  onExportPDF,
  height = 400,
  showHeader = true,
  compactMode = true,
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const isFullscreen = fullscreenView === 'chart';
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const [visibleCriteria, setVisibleCriteria] = useState<Set<string>>(
    new Set(selectedCriteria.map((c) => c.id))
  );

  // Initialize with requirements visible, but no tool visible by default
  const [visibleTools, setVisibleTools] = useState<Set<string>>(() => {
    const tools = new Set(['requirements']);
    return tools;
  });

  // Update visible criteria when selected criteria changes
  useEffect(() => {
    setVisibleCriteria(new Set(selectedCriteria.map((c) => c.id)));
  }, [selectedCriteria]);

  useClickOutside(settingsRef, () => {
    if (settingsOpen) setSettingsOpen(false);
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
          title: (context: any) => {
            const criterionName = context[0].label;
            const toolName = context[0].dataset.label || '';
            const value = context[0].raw || 0;
            const isRequirements = toolName === 'Your Tool';
            return `${criterionName} - ${toolName}${
              isRequirements ? ' (Your Ranking)' : ' (Tool Ranking)'
            }`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
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
            size: compactMode ? 10 : 11,
          },
          callback: function (value: string) {
            // For compact mode or mobile screens, wrap text at shorter length
            const maxLength = compactMode || window.innerWidth < 1024 ? 10 : 12;
            const words = value.split(' ');
            let lines = [];
            let currentLine = '';

            words.forEach((word) => {
              if (currentLine.length + word.length > maxLength) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine += (currentLine.length === 0 ? '' : ' ') + word;
              }
            });
            if (currentLine.length > 0) {
              lines.push(currentLine);
            }
            return lines;
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
          offset: compactMode || window.innerWidth < 1024,
        },
      },
    },
  };

  // Compact Settings Panel Component
  const SettingsPanel = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50" ref={settingsRef}>
      <div className="flex items-center justify-between p-3 border-b bg-alpine-blue-50 rounded-t-lg">
        <h3 className="font-semibold text-alpine-blue-900">Chart Settings</h3>
        <button 
          onClick={() => setSettingsOpen(false)}
          className="text-alpine-blue-600 hover:text-alpine-blue-800 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Tools Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Tools</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleAllTools(true)}
                className="text-xs text-alpine-blue-600 hover:text-alpine-blue-800"
              >
                Show All
              </button>
              <button
                onClick={() => handleToggleAllTools(false)}
                className="text-xs text-alpine-blue-600 hover:text-alpine-blue-800"
              >
                Hide All
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleToggleTool('requirements')}
              className="flex items-center w-full px-2 py-1.5 text-left rounded hover:bg-alpine-blue-50 text-sm"
            >
              {visibleTools.has('requirements') ? (
                <Eye className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
              )}
              <span className="font-medium">Your Tool</span>
            </button>
            {selectedTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToggleTool(tool.id)}
                className="flex items-center w-full px-2 py-1.5 text-left rounded hover:bg-alpine-blue-50 text-sm"
              >
                {visibleTools.has(tool.id) ? (
                  <Eye className="w-4 h-4 mr-2 text-alpine-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="truncate">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Criteria Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">Criteria</h4>
            <span className="text-xs text-gray-500">Min 3 required</span>
          </div>
          <div className="space-y-1">
            {selectedCriteria.map((criterion) => (
              <button
                key={criterion.id}
                onClick={() => handleToggleCriterion(criterion.id)}
                className="flex items-center w-full px-2 py-1.5 text-left rounded hover:bg-alpine-blue-50 text-sm"
                disabled={visibleCriteria.has(criterion.id) && visibleCriteria.size <= 3}
              >
                {visibleCriteria.has(criterion.id) ? (
                  <Eye className="w-4 h-4 mr-2 text-alpine-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="truncate">{criterion.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Compact Tool Toggles Component
  const ToolToggles = () => (
    <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 border-t overflow-x-auto">
      <button
        onClick={() => handleToggleTool('requirements')}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
          visibleTools.has('requirements')
            ? 'bg-green-100 border-green-300 text-green-800'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className={`w-3 h-3 rounded-full border-2 ${
          visibleTools.has('requirements') 
            ? 'border-green-600 bg-green-200' 
            : 'border-gray-400'
        } ${visibleTools.has('requirements') ? '' : 'border-dashed'}`} />
        <span className="text-xs font-medium">Your Tool</span>
      </button>
      
      {selectedTools.slice(0, 4).map((tool, index) => {
        const [backgroundColor, borderColor] = getToolColor(index);
        const isVisible = visibleTools.has(tool.id);
        
        return (
          <button
            key={tool.id}
            onClick={() => handleToggleTool(tool.id)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
              isVisible
                ? 'bg-alpine-blue-50 border-alpine-blue-300 text-alpine-blue-800'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: isVisible ? backgroundColor : 'transparent',
                borderColor: isVisible ? borderColor : '#9CA3AF',
              }}
            />
            <span className="text-xs font-medium truncate max-w-20">{tool.name}</span>
          </button>
        );
      })}
      
      {selectedTools.length > 4 && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
        >
          <MoreHorizontal className="w-3 h-3" />
          <span className="text-xs">+{selectedTools.length - 4}</span>
        </button>
      )}
    </div>
  );

  const chartContent = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-alpine-blue-50">
          <div className="flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-alpine-blue-600" />
            <h3 className="text-sm font-semibold text-alpine-blue-900">
              Comparison Chart
            </h3>
            {!compactMode && (
              <span className="text-xs text-alpine-blue-700 bg-alpine-blue-100 px-2 py-1 rounded-full">
                {selectedCriteria.length} criteria • {selectedTools.length} tools
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-1.5 hover:bg-alpine-blue-100 rounded transition-colors"
            >
              <Settings className="w-4 h-4 text-alpine-blue-600" />
            </button>
            
            {!isMobile && (
              <button
                onClick={() => toggleFullscreen('chart')}
                className="p-1.5 hover:bg-alpine-blue-100 rounded transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-alpine-blue-600" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-alpine-blue-600" />
                )}
              </button>
            )}
            
            {settingsOpen && <SettingsPanel />}
          </div>
        </div>
      )}

      {/* Collapsible Instructions */}
      {!compactMode && (
        <div className="border-b bg-gray-50">
          <button
            onClick={() => setInstructionsCollapsed(!instructionsCollapsed)}
            className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Instructions</span>
            {instructionsCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {!instructionsCollapsed && (
            <div className="px-4 pb-3">
              <div className="text-xs text-gray-600 space-y-1">
                <p>• <strong>Your Tool:</strong> Green dashed line shows your rankings</p>
                <p>• <strong>Tools:</strong> Colored lines show tool capabilities</p>
                <p>• <strong>Toggle:</strong> Click buttons below to show/hide items</p>
                <p>• <strong>Details:</strong> Hover chart points for exact values</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool Toggles */}
      <ToolToggles />

      {/* Chart Area */}
      <div 
        className="relative"
        style={{ height: `${height}px` }}
      >
        <div className="absolute inset-4">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">Loading chart...</div>
            </div>
          }>
            <LazyRadarChart data={data} options={options} />
          </Suspense>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <div className="min-h-full">
          {chartContent}
        </div>
      </div>
    );
  }

  return chartContent;
};

export default EmbeddableComparisonChart; 