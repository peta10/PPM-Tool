import { Tool } from '../types';
import { FilterCondition } from '../components/filters/FilterSystem';

export const filterTools = (
  tools: Tool[],
  conditions: FilterCondition[],
  filterMode: 'AND' | 'OR',
  includeRemoved: boolean = false
): Tool[] => {  
  // Filter out incomplete conditions
  const validConditions = conditions.filter(condition => {
    if (!condition.type || !condition.value) return false;
    if (condition.type === 'Criteria') {
      return condition.operator !== undefined && condition.rating !== undefined;
    }
    return true;
  });

  if (validConditions.length === 0) return tools;

  return tools.filter(tool => {
    // Skip filtering for removed tools if not explicitly included
    if (!includeRemoved && tool.removed) return false;

    const results = validConditions.map(condition => {
      switch (condition.type) {
        case 'Methodology':
          return tool.methodologies?.includes(condition.value) || false;
        
        case 'Function':
          return tool.functions.includes(condition.value);
        
        case 'Criteria':
          const rating = tool.ratings[condition.value] || 0;
          const targetRating = condition.rating || 0;
          
          switch (condition.operator) {
            case '>': return rating > targetRating;
            case '>=': return rating >= targetRating;
            case '=': return rating === targetRating;
            case '<=': return rating <= targetRating;
            case '<': return rating < targetRating;
            default: return false;
          }
        
        default:
          return true;
      }
    });
    
    return filterMode === 'AND' 
      ? results.every(Boolean)
      : results.some(Boolean);
  });
};