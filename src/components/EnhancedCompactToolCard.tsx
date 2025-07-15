import React from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Star, TrendingUp } from 'lucide-react';
import { Tool, Criterion } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface EnhancedCompactToolCardProps {
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

// Helper function to get criteria count that exceed user requirements
const getCriteriaExceededCount = (tool: Tool, criteria: Criterion[]): number => {
  return criteria.filter(criterion => {
    const toolRating = getToolRating(tool, criterion);
    return toolRating >= criterion.userRating;
  }).length;
};

// Helper function to get match score display
const getMatchScoreDisplay = (score: number): { value: string; color: string; variant: "default" | "secondary" | "destructive"; bgColor: string; medal: string } => {
  if (score >= 8) {
    return { 
      value: `${score.toFixed(1)}/10`, 
      color: 'text-green-700', 
      variant: "default" as const,
      bgColor: 'bg-green-50 border-green-200',
      medal: '🥇'
    };
  } else if (score >= 6) {
    return { 
      value: `${score.toFixed(1)}/10`, 
      color: 'text-blue-700', 
      variant: "default" as const,
      bgColor: 'bg-blue-50 border-blue-200',
      medal: '🥈'
    };
  } else {
    return { 
      value: `${score.toFixed(1)}/10`, 
      color: 'text-gray-700', 
      variant: "secondary" as const,
      bgColor: 'bg-gray-50 border-gray-200',
      medal: '🥉'
    };
  }
};

// Mock trial URLs - in a real implementation, these would come from the database
const getTrialUrl = (toolName: string) => {
  const trialUrls: Record<string, string> = {
    'Smartsheet': 'https://www.smartsheet.com/try',
    'Airtable': 'https://airtable.com/signup',
    'Asana': 'https://asana.com/create-account',
    'Monday.com': 'https://monday.com/signup',
    'Microsoft Project': 'https://www.microsoft.com/en-us/microsoft-365/project/compare-microsoft-project-management-software',
    'Jira': 'https://www.atlassian.com/software/jira/free',
    'Notion': 'https://www.notion.so/signup',
    'ClickUp': 'https://clickup.com/signup',
    'Trello': 'https://trello.com/signup',
    'Basecamp': 'https://basecamp.com/personal/sign_up'
  };
  return trialUrls[toolName] || '#';
};

export const EnhancedCompactToolCard: React.FC<EnhancedCompactToolCardProps> = ({
  tool,
  selectedCriteria,
  matchScore,
  isExpanded,
  onToggleExpand,
}) => {
  const matchDisplay = getMatchScoreDisplay(matchScore);
  const criteriaExceeded = getCriteriaExceededCount(tool, selectedCriteria);
  const matchPercentage = selectedCriteria.length > 0 ? (criteriaExceeded / selectedCriteria.length) * 100 : 0;

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-lg border-2 hover:border-alpine-blue-200 cursor-pointer"
      onClick={onToggleExpand}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-midnight-800 truncate">{tool.name}</CardTitle>
              <div className={`inline-flex items-center px-2 py-1 rounded-lg ${matchDisplay.bgColor}`}>
                <span className="text-lg mr-1">{matchDisplay.medal}</span>
                <span className={`text-sm font-bold ${matchDisplay.color}`}>{matchDisplay.value}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-green-600 text-sm font-medium">✅ {criteriaExceeded}/{selectedCriteria.length}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-alpine-blue-500" />
                <span className="text-sm font-medium text-alpine-blue-600">{matchPercentage.toFixed(0)}% match</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {(tool.tags || []).slice(0, 4).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs font-medium bg-alpine-blue-50 text-alpine-blue-700 border-alpine-blue-200">
              {tag.name}
            </Badge>
          ))}
          {(tool.tags || []).length > 4 && (
            <Badge variant="outline" className="text-xs bg-gray-50">
              +{(tool.tags || []).length - 4} more
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" className="flex-1 bg-alpine-blue-500 hover:bg-alpine-blue-600" asChild>
            <a 
              href={getTrialUrl(tool.name)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Try Free Trial</span>
            </a>
          </Button>
          
          <Button variant="outline" size="sm" className="flex-1 border-alpine-blue-200 text-alpine-blue-600 hover:bg-alpine-blue-50">
            <Star className="w-4 h-4 mr-2" />
            Add to Compare
          </Button>
        </div>

        <div className="cursor-pointer -mx-6 -mb-6 px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-t flex items-center justify-center gap-2 text-sm font-medium text-alpine-blue-600">
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View Details
            </>
          )}
        </div>
          
        {isExpanded && (
          <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            {selectedCriteria.map((criterion) => {
              const toolRating = getToolRating(tool, criterion);
              const userRating = criterion.userRating;
              const explanation = getToolExplanation(tool, criterion);
              const meetsRequirement = toolRating >= userRating;

              return (
                <div key={criterion.id} className={`p-3 rounded-lg border ${meetsRequirement ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-midnight-800">{criterion.name}</span>
                      <Badge variant={meetsRequirement ? "default" : "destructive"} className="text-xs">
                        {toolRating}/5
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      Required: {userRating}/5
                    </div>
                    <Progress value={(toolRating / 5) * 100} className="h-1.5" />
                    {explanation && (
                      <div className="text-xs text-gray-700 bg-white/60 p-2 rounded">
                        {explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 