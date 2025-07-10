import { Tool, Criterion } from '../../types';

export const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateToolScore = (tool: Tool, criteria: Criterion[]) => {
  let totalScore = 0;
  criteria.forEach((criterion) => {
    const toolRating = tool.ratings[criterion.id];
    const userRating = criterion.userRating;
    totalScore += toolRating >= userRating ? 10 : 10 - (userRating - toolRating);
  });
  return totalScore / criteria.length;
};

export const getTopPerformerStrengths = (tool: Tool, criteria: Criterion[]): string => {
  const strengths = criteria
    .filter(c => tool.ratings[c.id] >= 8)
    .map(c => c.name)
    .slice(0, 3);
  
  return strengths.join(', ');
};