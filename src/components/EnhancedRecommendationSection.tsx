import React from 'react';
import { Tool, Criterion } from '../types';
import { Award, Maximize2, Minimize2, AlertTriangle, ExternalLink, Star, TrendingUp } from 'lucide-react';
import { useFullscreen } from '../contexts/FullscreenContext';
import { FullscreenNavigation } from './FullscreenNavigation';
import { Header } from './Header';
import { StepsSection } from './StepsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecommendationSectionProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
  onExportPDF?: () => void;
}

export const EnhancedRecommendationSection: React.FC<RecommendationSectionProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { fullscreenView, toggleFullscreen, isMobile } = useFullscreen();
  const isFullscreen = fullscreenView === 'recommendations';

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

    const finalScore = selectedCriteria.length > 0 
      ? (totalScore / selectedCriteria.length) 
      : 0;

    return finalScore;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  const getCriteriaMatchCount = (tool: Tool) => {
    return selectedCriteria.filter(criterion => {
      const criterionData = tool.criteria.find(
        (c) => c.id === criterion.id || c.name === criterion.name
      );
      const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
      return toolRating >= criterion.userRating;
    }).length;
  };

  const sortedTools = React.useMemo(() => {
    return [...selectedTools].sort((a, b) => calculateScore(b) - calculateScore(a));
  }, [selectedTools, selectedCriteria]);

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

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Tool Finder Results</h2>
            <p className="text-sm text-muted-foreground">
              {selectedCriteria.length} criteria • {selectedTools.length} tools analyzed
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FullscreenNavigation />
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFullscreen('recommendations')}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Score Info */}
      <div className="px-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="score-info" className="border-0">
            <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Understanding Match Scores
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <p>Tools are scored based on how well they meet your requirements:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">8.0-10.0</Badge>
                  <span>Perfect matches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">6.0-7.9</Badge>
                  <span>Good matches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">0.0-5.9</Badge>
                  <span>Below requirements</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Tool Cards */}
      <div className="px-6 space-y-4">
        {sortedTools.map((tool, index) => {
          const score = calculateScore(tool);
          const matchCount = getCriteriaMatchCount(tool);
          const matchPercentage = selectedCriteria.length > 0 ? (matchCount / selectedCriteria.length) * 100 : 0;

          return (
            <Card key={`recommendation-${tool.id}-${index}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      {index === 0 && <span className="text-2xl" title="1st Place">🥇</span>}
                      {index === 1 && <span className="text-2xl" title="2nd Place">🥈</span>}
                      {index === 2 && <span className="text-2xl" title="3rd Place">🥉</span>}
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      <span>Meets {matchCount}/{selectedCriteria.length} criteria</span>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{matchPercentage.toFixed(0)}% match</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score.toFixed(1)}
                    </div>
                    <Badge variant={getScoreBadgeVariant(score)} className="text-xs">
                      {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : 'Below Target'}
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
                <Accordion type="single" collapsible>
                  <AccordionItem value="details" className="border-0">
                    <AccordionTrigger className="text-sm py-2">
                      View Detailed Breakdown
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCriteria.map((criterion) => {
                          const criterionData = tool.criteria.find(
                            (c) => c.id === criterion.id || c.name === criterion.name
                          );
                          const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
                          const userRating = criterion.userRating;
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
        })}
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 bg-muted/50 rounded-lg border border-muted text-sm text-muted-foreground hover:bg-muted/70 transition-colors cursor-help">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p>
                    <strong>Disclaimer:</strong> Recommendations are for informational purposes only. 
                    Hover for more details.
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-80 p-3" side="top">
              <div className="space-y-2 text-xs">
                <p className="font-medium">Important Information:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Based on user criteria and publicly available information</li>
                  <li>Generated through automated scoring system</li>
                  <li>Not a guarantee of product performance</li>
                  <li>Tool features may vary by version and implementation</li>
                </ul>
                <p className="font-medium">We recommend:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Testing tools in your specific environment</li>
                  <li>Consulting with vendors for current specifications</li>
                  <li>Conducting your own due diligence</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex flex-col h-full">
          <Header />
          <StepsSection />
          <div className="flex-1 overflow-y-auto">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="recommendations-section" className="bg-background rounded-lg border shadow-sm">
      <div className="flex flex-col h-full">
        {content}
      </div>
    </div>
  );
}; 