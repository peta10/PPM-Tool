import React, { useState, useRef } from 'react';
import { Plus, Eye, Sliders } from 'lucide-react';
import { Criterion } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';

interface RemovedCriteriaMenuProps {
  removedCriteria: Criterion[];
  onRestore: (criterion: Criterion) => void;
  onRestoreAll?: () => void;
}

export const RemovedCriteriaMenu: React.FC<RemovedCriteriaMenuProps> = ({
  removedCriteria,
  onRestore,
  onRestoreAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  if (removedCriteria.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {removedCriteria.map((criterion) => (
          <button
            key={criterion.id}
            onClick={() => onRestore(criterion)}
            className="group flex items-center justify-between px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-sm text-gray-700">{criterion.name}</span>
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        ))}
      </div>
    </div>
  );
};