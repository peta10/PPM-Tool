import { jsPDF } from 'jspdf';
import { Tool, Criterion } from '../../types';
import { addCoverPage } from './sections/coverPage';
import { addExecutiveSummary } from './sections/executiveSummary';
import { addComparisonTable } from './sections/comparisonTable';
import { addRadarChartSection } from './sections/radarCharts';
import { addDetailedRankings } from './sections/detailedRankings';
import { addPageNumbers } from './utils';

export const generateReport = async (
  tools: Tool[],
  criteria: Criterion[],
) => {
  const pdf = new jsPDF();

  // Add cover page
  addCoverPage(pdf);

  // Add executive summary
  pdf.addPage();
  await addExecutiveSummary(pdf, tools, criteria);

  // Add comparison table
  pdf.addPage();
  const tableEndY = addComparisonTable(pdf, tools, criteria);

  // Add radar chart analysis
  addRadarChartSection(pdf, tools, criteria, tableEndY);

  // Add detailed rankings and recommendations
  pdf.addPage();
  addDetailedRankings(pdf, tools, criteria);

  // Add page numbers
  addPageNumbers(pdf);

  pdf.save('ppm-tool-comparison-report.pdf');
};

export * from './types';
export * from './constants';
export * from './utils';