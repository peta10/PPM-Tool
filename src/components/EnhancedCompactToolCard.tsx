import React from 'react';
import { ExternalLink, Star, TrendingUp } from 'lucide-react';
import { Tool, Criterion } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Helper function to get criteria count that exceed user requirements
const getCriteriaExceededCount = (tool: Tool, criteria: Criterion[]): number => {
  return criteria.filter(criterion => {
    const toolRating = getToolRating(tool, criterion);
    return toolRating >= criterion.userRating;
  }).length;
};

// Helper function to get match score display
const getMatchScoreDisplay = (score: number): { value: string; color: string; variant: "default" | "secondary" | "destructive" } => {
  if (score >= 8) {
    return { value: `${score.toFixed(1)}/10`, color: 'text-green-600', variant: 'default' };
  } else if (score >= 6) {
    return { value: `${score.toFixed(1)}/10`, color: 'text-amber-600', variant: 'secondary' };
  } else {
    return { value: `${score.toFixed(1)}/10`, color: 'text-red-600', variant: 'destructive' };
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
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <span>Meets {criteriaExceeded}/{selectedCriteria.length} criteria</span>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{matchPercentage.toFixed(0)}% match</span>
              </div>
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className={`text-xl font-bold ${matchDisplay.color}`}>
              {matchDisplay.value}
            </div>
            <Badge variant={matchDisplay.variant} className="text-xs">
              {matchScore >= 8 ? 'Excellent' : matchScore >= 6 ? 'Good' : 'Below Target'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Match</span>
            <span className="font-medium">{matchPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={matchPercentage} className="h-2" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(tool.tags || []).slice(0, 4).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {(tool.tags || []).length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{(tool.tags || []).length - 4} more
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" asChild>
                  <a 
                    href={getTrialUrl(tool.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Try Free</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a free trial of {tool.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm">
            <Star className="w-3 h-3 mr-1" />
            Compare
          </Button>
        </div>

        {/* Detailed Breakdown */}
        <Accordion type="single" collapsible value={isExpanded ? "details" : ""} onValueChange={() => onToggleExpand()}>
          <AccordionItem value="details" className="border-0">
            <AccordionTrigger className="text-sm py-2">
              View Detailed Breakdown
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCriteria.map((criterion) => {
                  const toolRating = getToolRating(tool, criterion);
                  const userRating = criterion.userRating;
                  const explanation = getToolExplanation(tool, criterion);
                  const comparison = toolRating >= userRating ? 'meets' : 'below';

                  return (
                    <Card key={criterion.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{criterion.name}</span>
                          <Badge 
                            variant={toolRating >= userRating ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {toolRating}/5
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Your requirement: {userRating}/5 • Tool {comparison} requirement
                        </div>
                        <Progress 
                          value={(toolRating / 5) * 100} 
                          className="h-1"
                        />
                        {explanation && (
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {explanation}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}; 