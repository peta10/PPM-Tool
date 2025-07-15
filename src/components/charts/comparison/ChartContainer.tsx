import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ChartContainerProps {
  data: ChartData<'radar'>;
  options: ChartOptions<'radar'>;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ data, options }) => {
  return <Radar data={data} options={options} />;
};

export default ChartContainer;