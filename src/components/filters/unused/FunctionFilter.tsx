import React from 'react';
import { Briefcase } from 'lucide-react';

const FUNCTIONS = [
  'Customer Service',
  'Engineering',
  'Finance',
  'HR',
  'Legal',
  'IT & Support',
  'Manufacturing',
  'Marketing',
  'Operations',
  'Order Fulfillment',
  'Product & Design',
  'Sales & Account Management'
] as const;

interface FunctionFilterProps {
  selectedFunctions: Set<string>;
  onToggleFunction: (fn: string) => void;
  filterMode: 'AND' | 'OR';
  onToggleFilterMode: () => void;
}

export const FunctionFilter: React.FC<FunctionFilterProps> = ({
  selectedFunctions,
  onToggleFunction,
  filterMode,
  onToggleFilterMode,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Function</span>
        </div>
        <button
          onClick={onToggleFilterMode}
                      className="text-xs font-medium text-alpine-blue-500 hover:text-alpine-blue-700"
        >
          Match {filterMode === 'AND' ? 'ALL' : 'ANY'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FUNCTIONS.map((fn) => (
          <button
            key={fn}
            onClick={() => onToggleFunction(fn)}
            className={`px-3 py-1 text-sm rounded-full transition-colors text-left ${
              selectedFunctions.has(fn)
                ? 'bg-alpine-blue-100 text-alpine-blue-700 hover:bg-alpine-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {fn}
          </button>
        ))}
      </div>
    </div>
  );
};