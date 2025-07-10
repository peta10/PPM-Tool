import { jsPDF } from 'jspdf';
import { Tool, Criterion } from '../../../types';
import { MARGIN, PAGE_WIDTH, PAGE_HEIGHT, CONTENT_WIDTH, COLORS, FONT_SIZES } from '../constants';
import { getToolColor } from '../../chartColors';
import { getToolRating } from '../utils';

const createRadarChart = (
  tool: Tool,
  selectedCriteria: Criterion[],
  canvas: HTMLCanvasElement,
  isComparison: boolean = false
) => {
  const ctx = canvas.getContext('2d')!;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.6;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw axis lines and labels
  const angleStep = (2 * Math.PI) / selectedCriteria.length;
  selectedCriteria.forEach((criterion, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    // Draw axis line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelX = centerX + Math.cos(angle) * (radius + 40);
    const labelY = centerY + Math.sin(angle) * (radius + 40);
    
    // Split long labels into multiple lines
    const words = criterion.name.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if (currentLine.length + word.length > 12) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += (currentLine.length === 0 ? '' : ' ') + word;
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // Draw each line of the label
    lines.forEach((line, lineIndex) => {
      const offset = (lines.length - 1) * 8;
      const y = labelY + (lineIndex * 16) - offset;
      ctx.fillText(line, labelX, y);
    });
  });

  // Draw straight grid lines for each scale point (1-5)
  for (let i = 1; i <= 5; i++) {
    const r = (radius * i) / 5;
    ctx.beginPath();
    
    // Draw straight lines between each axis point
    selectedCriteria.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Close the path by connecting back to the first point
    const firstAngle = -Math.PI / 2;
    const firstX = centerX + Math.cos(firstAngle) * r;
    const firstY = centerY + Math.sin(firstAngle) * r;
    ctx.lineTo(firstX, firstY);
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    
    // Add scale numbers
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.fillText(i.toString(), centerX + 5, centerY - r + 5);
  }

  // Draw data points and values
  const drawDataPoints = (data: number[], color: string, isDashed: boolean = false) => {
    ctx.beginPath();
    selectedCriteria.forEach((criterion, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = data[i];
      const r = (radius * value) / 5;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw value
      const valueX = centerX + Math.cos(angle) * (r + 15);
      const valueY = centerY + Math.sin(angle) * (r + 15);
      ctx.fillStyle = color;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(value.toString(), valueX, valueY);
    });

    // Close the path by connecting back to the first point
    const firstAngle = -Math.PI / 2;
    const firstValue = data[0];
    const firstR = (radius * firstValue) / 5;
    const firstX = centerX + Math.cos(firstAngle) * firstR;
    const firstY = centerY + Math.sin(firstAngle) * firstR;
    ctx.lineTo(firstX, firstY);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (isDashed) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.fillStyle = color.replace('1)', '0.2)');
    ctx.fill();
  };

  // Draw tool data with user requirements if in comparison mode
  if (isComparison) {
    drawDataPoints(
      selectedCriteria.map(c => c.userRating),
      'rgba(34, 197, 94, 1)', // Green
      true
    );
  }

  // Draw tool data using the getToolRating helper
  const toolRatings = selectedCriteria.map(criterion => getToolRating(tool, criterion.id));
  const [, borderColor] = getToolColor(0);
  drawDataPoints(toolRatings, borderColor);

  // Add legend
  const legendY = centerY + radius + 60;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  // Tool legend
  ctx.beginPath();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.moveTo(centerX - 100, legendY);
  ctx.lineTo(centerX - 60, legendY);
  ctx.stroke();
  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';
  ctx.fillText(tool.name, centerX - 50, legendY);

  // Requirements legend
  if (isComparison) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(centerX + 20, legendY);
    ctx.lineTo(centerX + 60, legendY);
    ctx.stroke();
    ctx.fillText('Your Requirements', centerX + 70, legendY);
  }
};

export const addRadarChartSection = async (
  pdf: jsPDF,
  tools: Tool[],
  selectedCriteria: Criterion[],
  startY: number
) => {
  let currentY = startY;

  // Section header
  pdf.setTextColor(...COLORS.INDIGO);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZES.HEADING);
  pdf.text('Radar Chart Analysis', MARGIN, currentY);

  currentY += 15;

  // Add individual tool radar charts
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    
    // Check for page break
    if (currentY > PAGE_HEIGHT - 180) {
      pdf.addPage();
      currentY = MARGIN + 20;
    }

    // Tool header
    pdf.setTextColor(...COLORS.INDIGO);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.BODY);
    pdf.text(`${tool.name} Analysis`, MARGIN, currentY);

    currentY += 15;

    // Create and add radar chart
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      createRadarChart(tool, selectedCriteria, canvas, true);

      const chartWidth = 160;
      const chartHeight = chartWidth;
      const chartX = (PAGE_WIDTH - chartWidth) / 2;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        chartX,
        currentY,
        chartWidth,
        chartHeight
      );

      currentY += chartHeight + 20;
    } catch (error) {
      console.error(`Error creating radar chart for ${tool.name}:`, error);
      currentY += 10; // Still increment Y position to maintain layout
    }
  }

  return currentY;
};