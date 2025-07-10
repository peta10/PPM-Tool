import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerTooltip: React.FC = () => {
  return (
    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-50">
      <div className="space-y-2">
        <p>
          <strong>Disclaimer:</strong> The recommendations and match scores provided are:
        </p>
        <ul className="space-y-1 text-gray-300">
          <li>• Based on user-provided criteria and publicly available information</li>
          <li>• Generated through an automated scoring system</li>
          <li>• Not a guarantee of product performance or suitability</li>
          <li>• Subject to change without notice</li>
        </ul>
        <p className="text-gray-300">
          Tool rankings and features may vary based on version, implementation, and specific use cases. Users should:
        </p>
        <ul className="space-y-1 text-gray-300">
          <li>• Conduct their own due diligence</li>
          <li>• Test tools in their specific environment</li>
          <li>• Consult with vendors for current specifications</li>
          <li>• Consider professional advice for critical decisions</li>
        </ul>
      </div>
      <div className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
    </div>
  );
};