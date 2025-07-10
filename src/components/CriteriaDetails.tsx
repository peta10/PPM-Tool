import React from 'react';
import { Tool, Criterion } from '../types';

interface CriteriaDetailsProps {
  tool: Tool;
  selectedCriteria: Criterion[];
}

export const CriteriaDetails: React.FC<CriteriaDetailsProps> = ({
  tool,
  selectedCriteria,
}) => {
  return (
    <div className="space-y-3">
      {selectedCriteria.map((criterion) => {
        const rating = tool.ratings?.[criterion.id] || 0;
        const description = tool.ratingExplanations?.[criterion.id] || '';

        return (
          <div key={criterion.id} className="text-sm space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {criterion.name}
              </span>
              <span
                className={`font-semibold ${
                  rating >= 4
                    ? 'text-green-600'
                    : rating >= 3
                    ? 'text-alpine-blue-500'
                    : 'text-gray-600'
                }`}
              >
                {rating}/5
              </span>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        );
      })}
    </div>
  );
};
