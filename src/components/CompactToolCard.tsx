import React from 'react';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Tool, Criterion } from '../types';

interface CompactToolCardProps {
  tool: Tool;
  selectedCriteria: Criterion[];
  matchScore: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// Helper function to get tool rating for a criterion
const getToolRating = (tool: Tool, criterion: Criterion): number => {
  try {
    if (Array.isArray(tool.criteria)) {
      const criterionDataById = tool.criteria.find(c => c.id === criterion.id);
      if (criterionDataById && typeof criterionDataById.ranking === 'number') {
        return criterionDataById.ranking;
      }
      
      const criterionDataByName = tool.criteria.find(c => c.name === criterion.name);
      if (criterionDataByName && typeof criterionDataByName.ranking === 'number') {
        return criterionDataByName.ranking;
      }
    }

    if (tool.ratings && typeof tool.ratings[criterion.id] === 'number') {
      return tool.ratings[criterion.id];
    }
    
    const criterionMappings: Record<string, string[]> = {
      'scalability': ['Scalability', 'scalability'],
      'integrations': ['Integrations & Extensibility', 'integrations', 'Integrations'],
      'easeOfUse': ['Ease of Use', 'easeOfUse', 'ease_of_use', 'ease-of-use'],
      'flexibility': ['Flexibility & Customization', 'flexibility', 'customization'],
      'ppmFeatures': ['Project Portfolio Management', 'ppmFeatures', 'ppm_features', 'ppm'],
      'reporting': ['Reporting & Analytics', 'reporting', 'analytics'],
      'security': ['Security & Compliance', 'security', 'compliance']
    };
    
    const possibleKeys = criterionMappings[criterion.id] || [criterion.name, criterion.id];
    
    for (const key of possibleKeys) {
      if (tool.ratings && typeof tool.ratings[key] === 'number') {
        return tool.ratings[key];
      }
    }
    
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

    return 0;
  } catch (error) {
    console.error(`Error getting rating for criterion ${criterion.name}:`, error);
    return 0;
  }
};

// Helper function to get tool explanation for a criterion
const getToolExplanation = (tool: Tool, criterion: Criterion): string => {
  try {
    if (Array.isArray(tool.criteria)) {
      const criterionData = tool.criteria.find(c => 
        c.id === criterion.id || c.name === criterion.name
      );
      if (criterionData && typeof criterionData.description === 'string') {
        return criterionData.description;
      }
    }

    if (tool.ratingExplanations && typeof tool.ratingExplanations[criterion.id] === 'string') {
      return tool.ratingExplanations[criterion.id];
    }

    return '';
  } catch (error) {
    console.warn(`Error getting explanation for criterion ${criterion.name}:`, error);
    return '';
  }
};

// Helper function to get top performer strengths
const getTopPerformerStrengths = (tool: Tool, criteria: Criterion[]): string => {
  try {
    const strengths = criteria
      .filter(c => {
        const rating = getToolRating(tool, c);
        return rating >= 4;
      })
      .map(c => c.name)
      .slice(0, 3);
    
    return strengths.length > 0 ? strengths.join(', ') : 'N/A';
  } catch (error) {
    console.warn('Error getting top performer strengths:', error);
    return 'N/A';
  }
};

// Helper function to get criteria count that exceed user requirements
const getCriteriaExceededCount = (tool: Tool, criteria: Criterion[]): number => {
  return criteria.filter(criterion => {
    const toolRating = getToolRating(tool, criterion);
    return toolRating >= criterion.userRating;
  }).length;
};

// Helper function to get match score display
const getMatchScoreDisplay = (score: number): { value: string; color: string; medal: string } => {
  if (score >= 8) {
    return { value: `${score.toFixed(1)}/10`, color: 'text-green-600', medal: '⭐' };
  } else if (score >= 6) {
    return { value: `${score.toFixed(1)}/10`, color: 'text-alpine-blue-500', medal: '🥈' };
  } else {
    return { value: `${score.toFixed(1)}/10`, color: 'text-gray-600', medal: '🥉' };
  }
};

export const CompactToolCard: React.FC<CompactToolCardProps> = ({
  tool,
  selectedCriteria,
  matchScore,
  isExpanded,
  onToggleExpand,
}) => {
  const matchDisplay = getMatchScoreDisplay(matchScore);
  const criteriaExceeded = getCriteriaExceededCount(tool, selectedCriteria);
  const topStrengths = getTopPerformerStrengths(tool, selectedCriteria);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow duration-200 tool-card-transition">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold text-midnight-800">{tool.name}</div>
        <div className="flex flex-col items-end">
          <div className={`text-lg font-bold ${matchDisplay.color}`}>
            {matchDisplay.value} {matchDisplay.medal}
          </div>
          <div className="text-xs text-gray-500">Match Score</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-3 h-3 text-gray-400" />
        <div className="flex flex-wrap gap-1.5">
          {(tool.tags || []).slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs rounded-full bg-snow-white text-midnight-700 border border-gray-200"
            >
              {tag.name}
            </span>
          ))}
          {(tool.tags || []).length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              +{(tool.tags || []).length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 mb-2">
        <span className="text-green-600 font-medium">
          ✅ Exceeds {criteriaExceeded}/{selectedCriteria.length} criteria
        </span>
        {topStrengths !== 'N/A' && (
          <>
            {' • '}
            <span>Key strengths: {topStrengths}</span>
          </>
        )}
      </div>

      {/* Expand Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        className="flex items-center gap-2 text-sm text-alpine-blue-500 hover:text-alpine-blue-700 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide detailed breakdown
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View detailed breakdown
          </>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-snow-white border-l-4 border-alpine-blue-500 rounded-r-md">
          <h4 className="font-semibold text-midnight-800 mb-3">Detailed Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedCriteria.map((criterion) => {
              const toolRating = getToolRating(tool, criterion);
              const explanation = getToolExplanation(tool, criterion);
              const comparison = toolRating > criterion.userRating 
                ? 'Exceeds your ranking' 
                : toolRating === criterion.userRating 
                ? 'Meets your ranking' 
                : 'Below your ranking';
              
              const ratingColor = toolRating > criterion.userRating 
                ? 'text-green-600' 
                : toolRating === criterion.userRating 
                ? 'text-alpine-blue-500' 
                : 'text-red-600';

              return (
                <div key={criterion.id} className="bg-white p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-midnight-800">{criterion.name}</span>
                    <span className={`font-bold text-sm ${ratingColor}`}>{toolRating}/5</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Your Ranking: {criterion.userRating}/5 • {comparison}
                  </div>
                  {explanation && (
                    <div className="text-xs text-gray-600 leading-relaxed">
                      {explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 