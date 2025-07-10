import React from 'react';
import { Tool, Criterion } from '../types';
import { criteriaDescriptions } from '../data/criteriaDescriptions';

interface CriteriaRatingsProps {
  tool: Tool;
  selectedCriteria: Criterion[];
  compact?: boolean;
}

export const CriteriaRatings: React.FC<CriteriaRatingsProps> = ({
  tool,
  selectedCriteria,
  compact = false
}) => {
  return (
    <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-4'}`}>
      {selectedCriteria.map((criterion) => (
        <div key={criterion.id} className="flex items-center justify-between">
          <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {criterion.name}
          </span>
          <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'} ${
            tool.ratings[criterion.id] >= 4 ? 'text-green-600' :
            tool.ratings[criterion.id] >= 3 ? 'text-alpine-blue-500' :
            'text-gray-600'
          }`}>
            {tool.ratings[criterion.id]}/5
          </span>
        </div>
      ))}
    </div>
  );
};