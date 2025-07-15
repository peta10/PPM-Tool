import { Tool, Criterion } from '../../../types';
import { PDFDocument } from '../PDFDocument';
import { createRadarChart } from '../charts';

export const addToolAnalysis = (
  doc: PDFDocument,
  tool: Tool,
  selectedCriteria: Criterion[],
  isFirstTool: boolean
) => {
  if (!isFirstTool) {
    doc.addPage();
  }
  
  // Add tool header
  doc.addHeading(`${tool.name} Analysis`, 2);

  // Create canvas for chart
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  createRadarChart(tool, selectedCriteria, canvas, true);

  // Calculate chart dimensions to fit page
  const chartWidth = 160;
  const chartHeight = (canvas.height * chartWidth) / canvas.width;

  // Add chart
  doc.addImage(
    canvas.toDataURL('image/png'),
    chartWidth,
    chartHeight,
    { center: true }
  );

  // Add criteria breakdown section
  doc.addSection('Criteria Breakdown', () => {
    selectedCriteria.forEach(criterion => {
      // Check if we need a new page for this criterion block
      // Each criterion takes about 50 units of height
      doc.checkPageBreak(50);
      
      const toolRating = tool.ratings[criterion.id];
      const userRating = criterion.userRating;

      doc.setStyle({ font: 'bold', size: 12 });
      doc.addText(criterion.name);
      
      // Add extra spacing after criterion name
      doc.addSpacing(5);
      
      doc.setStyle({ font: 'normal', size: 10 });
      doc.addText(`Your Ranking: ${userRating}/10`, 10);
      doc.addText(`Tool Ranking: ${toolRating}/10`, 10);
      doc.addText(
        toolRating >= userRating 
          ? 'Exceeds your requirements'
          : `Below requirements by ${userRating - toolRating} points`,
        10
      );
      
      // Add extra spacing between criteria
      doc.addSpacing(15);
    });
  });
};