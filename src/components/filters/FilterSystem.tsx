import React from 'react';
import { Filter, Plus, X } from 'lucide-react';
import { Criterion } from '../../types';

export type FilterType = 'Methodology' | 'Function' | 'Criteria';

export interface FilterCondition {
  id: string;
  type: FilterType;
  value: string;
  operator?: '>' | '>=' | '=' | '<=' | '<';
  rating?: number;
}

interface FilterSystemProps {
  selectedCriteria: Criterion[];
  conditions: FilterCondition[];
  onAddCondition: () => void;
  incompleteFilterId: string | null;
  onRemoveCondition: (id: string) => void;
  onUpdateCondition: (id: string, updates: Partial<FilterCondition>) => void;
  filterMode: 'AND' | 'OR';
  onToggleFilterMode: () => void;
}

const METHODOLOGIES = ['Waterfall', 'Agile', 'Continuous Improvement'];
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
];

export const FilterSystem: React.FC<FilterSystemProps> = ({
  selectedCriteria,
  conditions,
  onAddCondition,
  incompleteFilterId,
  onRemoveCondition,
  onUpdateCondition,
  filterMode,
  onToggleFilterMode,
}) => {
  const isFieldIncomplete = (condition: FilterCondition, fieldName: keyof FilterCondition) => {
    if (!incompleteFilterId || incompleteFilterId !== 'all') return false;
    
    // Only highlight if the user has started filling out the filter
    const hasStartedFilter = condition.type || condition.value;
    if (!hasStartedFilter) return false;
    
    switch (fieldName) {
      case 'type':
        return false; // Don't highlight type field, it's the starting point
      case 'value':
        return condition.type && !condition.value;
      case 'operator':
        return condition.type === 'Criteria' && condition.value && !condition.operator;
      case 'rating':
        return condition.type === 'Criteria' && condition.value && condition.operator && condition.rating === undefined;
      default:
        return false;
    }
  };

  const isConditionIncomplete = (condition: FilterCondition) => {
    // Only consider incomplete if user has started but not finished
    if (!condition.type && !condition.value) return false; // Completely empty is fine
    if (!condition.type) return true; // Has value but no type
    if (!condition.value) return true; // Has type but no value
    if (condition.type === 'Criteria') {
      return !condition.operator || condition.rating === undefined;
    }
    return false;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <button
          onClick={onToggleFilterMode}
                      className="text-xs font-medium text-alpine-blue-500 hover:text-alpine-blue-700"
        >
          Match {filterMode === 'AND' ? 'ALL' : 'ANY'}
        </button>
      </div>

      <div className="space-y-2">
        {conditions.map((condition) => {
          const hasError = incompleteFilterId === 'all' && isConditionIncomplete(condition);
          
          return (
            <div 
              key={condition.id} 
              className={`grid grid-cols-[8.5rem_1fr_2.5rem] gap-2 items-center relative ${
                hasError ? 'animate-shake' : ''
              }`}
            >
              <select
                value={condition.type}
                onChange={(e) => onUpdateCondition(condition.id, { 
                  type: e.target.value as FilterType,
                  value: '',
                  operator: undefined,
                  rating: undefined
                })}
                className={`text-sm rounded-md border py-1.5 px-3 ${
                  isFieldIncomplete(condition, 'type')
                    ? 'border-red-300 ring-1 ring-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-alpine-blue-500 focus:ring-1 focus:ring-alpine-blue-500'
                }`}
              >
                <option value="">Select type...</option>
                <option value="Methodology">Methodology</option>
                <option value="Function">Function</option>
                <option value="Criteria">Criteria</option>
              </select>

              {condition.type === 'Criteria' && (
                <div className="grid grid-cols-[1fr_4.5rem_4rem] gap-2">
                  <select
                    value={condition.value}
                    onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
                    className={`text-sm rounded-md border py-1.5 px-3 ${
                      isFieldIncomplete(condition, 'value')
                        ? 'border-red-300 ring-1 ring-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-alpine-blue-500 focus:ring-1 focus:ring-alpine-blue-500'
                    }`}
                  >
                    <option value="">Select criteria...</option>
                    {selectedCriteria.map((criterion) => (
                      <option key={criterion.id} value={criterion.id}>
                        {criterion.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) => onUpdateCondition(condition.id, { 
                      operator: e.target.value as '>' | '>=' | '=' | '<=' | '<'
                    })}
                    className={`text-sm rounded-md border py-1.5 px-3 ${
                      isFieldIncomplete(condition, 'operator')
                        ? 'border-red-300 ring-1 ring-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-alpine-blue-500 focus:ring-1 focus:ring-alpine-blue-500'
                    }`}
                  >
                    <option value="">...</option>
                    <option value=">">{'>'}</option>
                    <option value=">=">{'>='}</option>
                    <option value="=">{'='}</option>
                    <option value="<=">{'<='}</option>
                    <option value="<">{'<'}</option>
                  </select>
                  <select
                    value={condition.rating || ''}
                    onChange={(e) => onUpdateCondition(condition.id, { 
                      rating: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className={`text-sm rounded-md border py-1.5 px-3 w-16 text-center [&>*]:text-center ${
                      isFieldIncomplete(condition, 'rating')
                        ? 'border-red-300 ring-1 ring-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-alpine-blue-500 focus:ring-1 focus:ring-alpine-blue-500'
                    }`}
                  >
                    <option value="">...</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              )}
              {(condition.type === 'Methodology' || condition.type === 'Function') && (
                <select
                  value={condition.value}
                  onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
                  className={`text-sm rounded-md border py-1.5 px-3 ${
                    isFieldIncomplete(condition, 'value')
                      ? 'border-red-300 ring-1 ring-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-alpine-blue-500 focus:ring-1 focus:ring-alpine-blue-500'
                  }`}
                >
                  <option value="">Select option...</option>
                  {(condition.type === 'Methodology' ? METHODOLOGIES : FUNCTIONS).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              
              <button
                onClick={() => onRemoveCondition(condition.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Remove filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onAddCondition}
                    className="flex items-center space-x-1 text-sm text-alpine-blue-500 hover:text-alpine-blue-700"
      >
        <Plus className="w-4 h-4" />
        <span>Add Filter</span>
      </button>
    </div>
  );
};