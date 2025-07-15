import React, { useState, Suspense } from 'react';
import { Tool, Criterion } from '../types';
import { LineChart } from 'lucide-react';
import { ChartControls } from './ChartControls';
import { getToolColor } from '../utils/chartColors';
import { useFullscreen } from '../contexts/FullscreenContext';
import { FullscreenNavigation } from './FullscreenNavigation';
import { ChartData, ChartOptions } from 'chart.js';

interface ComparisonChartProps {
  selectedTools: Tool[];
  selectedCriteria: Criterion[];
  onExportPDF?: () => void;
}

// Lazy load the radar chart component
const LazyRadarChart = React.lazy(() => import('./comparison/ChartContainer'));

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  selectedTools,
  selectedCriteria,
}) => {
  const { toggleFullscreen, fullscreenView } = useFullscreen();
  const [visibleTools, setVisibleTools] = useState<Set<string>>(
    new Set(['requirements', ...selectedTools.map(t => t.id)])
  );
  const [visibleCriteria, setVisibleCriteria] = useState<Set<string>>(
    new Set(selectedCriteria.map(c => c.id))
  );

  // Handle toggling tools and criteria visibility
  const handleToggleTool = (toolId: string) => {
    setVisibleTools(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  const handleToggleCriterion = (criterionId: string) => {
    setVisibleCriteria(prev => {
      const next = new Set(prev);
      if (next.has(criterionId)) {
        next.delete(criterionId);
      } else {
        next.add(criterionId);
      }
      return next;
    });
  };

  const handleToggleAllTools = () => {
    setVisibleTools(prev => {
      if (prev.size === selectedTools.length + 1) {
        return new Set();
      }
      return new Set(['requirements', ...selectedTools.map(t => t.id)]);
    });
  };

  const handleToggleAllCriteria = () => {
    setVisibleCriteria(prev => {
      if (prev.size === selectedCriteria.length) {
        return new Set();
      }
      return new Set(selectedCriteria.map(c => c.id));
    });
  };

  // Prepare chart data
  const data: ChartData<'radar'> = {
    labels: selectedCriteria.map(c => c.name),
    datasets: [
      {
        label: 'Your Requirements',
        data: selectedCriteria.map(c => c.userRating),
        borderDash: [5, 5],
        borderColor: 'rgba(34, 197, 94, 0.8)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
      },
      ...selectedTools.map((tool, index) => {
        const [backgroundColor, borderColor] = getToolColor(index);
        return {
          label: tool.name,
          data: selectedCriteria.map(criterion => {
            const criterionData = tool.criteria.find(
              c => c.id === criterion.id || c.name === criterion.name
            );
            return criterionData?.ranking || tool.ratings[criterion.id] || 0;
          }),
          borderColor,
          backgroundColor: backgroundColor + '20',
          borderWidth: 2,
        };
      }),
    ],
  };

  // Chart options
  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.r;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 pb-4 border-b">
        <div className="flex items-center">
          <LineChart className="w-6 h-6 mr-2 text-alpine-blue-500" />
          <h2 className="text-xl font-bold">Tools - Criteria Comparison</h2>
          <p className="hidden lg:block text-sm text-gray-500 ml-2">
            {selectedCriteria.length} criteria considered •{' '}
            {selectedTools.length}{' '}
            {selectedTools.length === 1 ? 'tool' : 'tools'} analyzed
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <ChartControls
            selectedTools={selectedTools}
            selectedCriteria={selectedCriteria}
            visibleTools={visibleTools}
            visibleCriteria={visibleCriteria}
            onToggleTool={handleToggleTool}
            onToggleCriterion={handleToggleCriterion}
            onToggleAllTools={handleToggleAllTools}
            onToggleAllCriteria={handleToggleAllCriteria}
            onMinimize={() => toggleFullscreen('chart')}
          />
          <FullscreenNavigation />
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 min-h-[600px]">
        <Suspense fallback={<div>Loading Chart...</div>}>
          <LazyRadarChart data={data} options={options} />
        </Suspense>
      </div>
    </div>
  );

  return (
    <div className={`${fullscreenView === 'chart' ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`flex flex-col h-full ${fullscreenView === 'chart' ? 'overflow-y-auto' : ''}`}>
        {content}
      </div>
    </div>
  );
};

export default ComparisonChart;