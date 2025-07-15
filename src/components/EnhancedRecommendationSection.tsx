import React from 'react';
import { Tool, Criterion } from '../types';
import { Award, Maximize2, Minimize2, AlertTriangle, ExternalLink, Star, TrendingUp } from 'lucide-react';
import { useFullscreen } from '../contexts/FullscreenContext';
import { FullscreenNavigation } from './FullscreenNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface RecommendationSectionProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
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

  // Enhanced score display function
  const getMatchScoreDisplay = (score: number): { value: string; color: string; bgColor: string; medal: string } => {
    if (score >= 8) {
      return { 
        value: `${score.toFixed(1)}/10`, 
        color: 'text-green-700', 
        bgColor: 'bg-green-50 border-green-200',
        medal: '🥇'
      };
    } else if (score >= 6) {
      return { 
        value: `${score.toFixed(1)}/10`, 
        color: 'text-alpine-blue-700', 
        bgColor: 'bg-alpine-blue-50 border-alpine-blue-200',
        medal: '🥈'
      };
    } else {
      return { 
        value: `${score.toFixed(1)}/10`, 
        color: 'text-gray-700', 
        bgColor: 'bg-gray-50 border-gray-200',
        medal: '🥉'
      };
    }
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

  // Calculate trophy positions based on distinct scores
  const getTrophyEmoji = (tool: Tool, index: number, allTools: Tool[]): string | null => {
    const currentScore = calculateScore(tool);
    
    // Get unique scores in descending order
    const uniqueScores = Array.from(new Set(allTools.map(t => calculateScore(t))))
      .sort((a, b) => b - a);
    
    const scoreRank = uniqueScores.indexOf(currentScore);
    
    if (scoreRank === 0) return '🏆'; // 1st place (highest score)
    if (scoreRank === 1) return '🥈'; // 2nd place  
    if (scoreRank === 2) return '🥉'; // 3rd place
    
    return null; // No trophy for 4th place and below
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

  const content = (
    <div className="space-y-6">
      {/* Enhanced Header with alpine-blue background */}
      <div className="flex items-center justify-between p-6 pb-4 border-b bg-alpine-blue-50">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-alpine-blue-500" />
          <div>
            <h2 className="text-xl font-bold text-midnight-800">Tool Finder Results</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
              <p className="text-sm text-midnight-600">
                {selectedCriteria.length} criteria • {selectedTools.length} tools analyzed
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FullscreenNavigation />
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFullscreen('recommendations')}
              className="hover:bg-alpine-blue-100"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-alpine-blue-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-alpine-blue-600" />
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
                  <span>Excellent matches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-alpine-blue-100 text-alpine-blue-800">6.0-7.9</Badge>
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

      {/* Enhanced Tool Cards */}
      <div className="px-6 space-y-4">
        {sortedTools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Award className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools to analyze</h3>
            <p className="text-gray-600 mb-4">Add some tools from the previous step to see your personalized recommendations.</p>
          </div>
        ) : (
          sortedTools.map((tool, index) => {
          const score = calculateScore(tool);
          const matchCount = getCriteriaMatchCount(tool);
          const matchPercentage = selectedCriteria.length > 0 ? (matchCount / selectedCriteria.length) * 100 : 0;
          const matchDisplay = getMatchScoreDisplay(score);
          const trophyEmoji = getTrophyEmoji(tool, index, sortedTools);

          return (
            <Card key={`recommendation-${tool.id}-${index}`} className="overflow-hidden border-2 hover:border-alpine-blue-200 transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-4">
                {/* Mobile-optimized header layout */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg sm:text-xl text-midnight-800 truncate">{tool.name}</CardTitle>
                      {trophyEmoji && <span className="text-2xl" title={`${trophyEmoji} Place`}>{trophyEmoji}</span>}
                    </div>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">✅ Meets {matchCount}/{selectedCriteria.length} criteria</span>
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-alpine-blue-500" />
                        <span className="font-medium text-alpine-blue-600">{matchPercentage.toFixed(0)}% match</span>
                      </div>
                    </CardDescription>
                  </div>
                  
                  {/* Enhanced match score display */}
                  <div className="flex-shrink-0 self-start sm:self-center">
                    <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${matchDisplay.bgColor} shadow-sm`}>
                      <span className="text-2xl">{matchDisplay.medal}</span>
                      <div className="text-right">
                        <div className={`text-xl sm:text-2xl font-bold ${matchDisplay.color}`}>
                          {matchDisplay.value}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Match Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Enhanced Match Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Overall Match Progress</span>
                    <span className="font-bold text-alpine-blue-600">{matchPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={matchPercentage} className="h-3 rounded-full" />
                  <div className="text-xs text-muted-foreground">
                    {score >= 8 ? "🎯 Excellent fit for your requirements" : 
                     score >= 6 ? "✨ Good match with minor gaps" : 
                     "⚠️ Review carefully - may have significant gaps"}
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {(tool.tags || []).slice(0, 6).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs font-medium bg-alpine-blue-50 text-alpine-blue-700 border-alpine-blue-200">
                        {tag.name}
                      </Badge>
                    ))}
                    {(tool.tags || []).length > 6 && (
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        +{(tool.tags || []).length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Enhanced Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" className="flex-1 sm:flex-initial bg-alpine-blue-500 hover:bg-alpine-blue-600" asChild>
                          <a 
                            href={getTrialUrl(tool.name)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Try Free Trial</span>
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Start a free trial of {tool.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-initial border-alpine-blue-200 text-alpine-blue-600 hover:bg-alpine-blue-50">
                    <Star className="w-4 h-4 mr-2" />
                    Add to Compare
                  </Button>
                </div>

                {/* Detailed Breakdown */}
                <Accordion type="single" collapsible>
                  <AccordionItem value={`details-${tool.id}`} className="border-0">
                    <AccordionTrigger className="text-sm font-medium text-alpine-blue-600 hover:text-alpine-blue-800 hover:bg-alpine-blue-50 rounded-lg px-3 py-2">
                      View Detailed Breakdown
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-4">
                      <div className="p-4 bg-gradient-to-br from-alpine-blue-25 to-snow-white rounded-lg border border-alpine-blue-100">
                        <h4 className="font-semibold text-midnight-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-alpine-blue-500 rounded-full"></span>
                          Detailed Criteria Analysis
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCriteria.map((criterion) => {
                            const criterionData = tool.criteria.find(
                              (c) => c.id === criterion.id || c.name === criterion.name
                            );
                            const toolRating = criterionData?.ranking || tool.ratings[criterion.id] || 0;
                            const userRating = criterion.userRating;
                            const explanation = criterionData?.description || '';
                            const comparison = toolRating >= userRating ? 'Meets your requirement' : 'Below your requirement';
                            const meetsRequirement = toolRating >= userRating;

                            return (
                              <Card key={criterion.id} className={`p-3 border-2 ${meetsRequirement ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm text-midnight-800 leading-tight">{criterion.name}</span>
                                    <Badge 
                                      variant={meetsRequirement ? "default" : "destructive"}
                                      className="text-xs font-bold"
                                    >
                                      {toolRating}/5
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    Your requirement: {userRating}/5 • {comparison}
                                  </div>
                                  <Progress 
                                    value={(toolRating / 5) * 100} 
                                    className="h-2"
                                  />
                                  {explanation && (
                                    <div className="text-xs text-gray-700 leading-relaxed bg-white/60 p-2 rounded border">
                                      {explanation}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        }))}
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
      <div className="flex-1 overflow-y-auto">
        {content}
      </div>
    );
  }

  return (
    <div id="recommendations-section" className="bg-white rounded-lg border shadow-sm">
      <div className="flex flex-col h-full">
        {content}
      </div>
    </div>
  );
}; 