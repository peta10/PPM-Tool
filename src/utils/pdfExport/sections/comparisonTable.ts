import { jsPDF } from 'jspdf';
import { Tool, Criterion } from '../../../types';
import { MARGIN, PAGE_WIDTH, PAGE_HEIGHT, CONTENT_WIDTH, COLORS, FONT_SIZES } from '../constants';
import { getToolRating } from '../utils';

const drawTableCell = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    align?: 'left' | 'center' | 'right';
    fontSize?: number;
    textColor?: number[];
    fillColor?: number[];
    bold?: boolean;
  } = {}
) => {
  try {
    // Draw cell border
    pdf.setDrawColor(...COLORS.GRAY);
    pdf.setLineWidth(0.1);
    pdf.rect(x, y, width, height);

    // Fill background if specified
    if (options.fillColor) {
      pdf.setFillColor(...options.fillColor);
      pdf.rect(x, y, width, height, 'F');
    }

    // Set text styles
    pdf.setFontSize(options.fontSize || 9);
    pdf.setTextColor(...(options.textColor || COLORS.GRAY));
    pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');

    // Calculate text position
    const textWidth = pdf.getTextWidth(text);
    let textX = x + 3; // Default left align with padding

    if (options.align === 'center') {
      textX = x + (width - textWidth) / 2;
    } else if (options.align === 'right') {
      textX = x + width - textWidth - 3;
    }

    // Draw text
    pdf.text(text, textX, y + height/2 + 3);
  } catch (error) {
    console.warn('Error drawing table cell:', error);
    // Continue without throwing to maintain table structure
  }
};

export const addComparisonTable = (
  pdf: jsPDF,
  tools: Tool[],
  criteria: Criterion[]
) => {
  try {
    let currentY = MARGIN;

    // Section header
    pdf.setTextColor(...COLORS.INDIGO);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.TITLE);
    pdf.text('2. Tool Comparison Analysis', MARGIN, currentY);

    currentY += 20;

    // Calculate column widths
    const criteriaWidth = 65;
    const requirementWidth = 20;
    const availableWidth = CONTENT_WIDTH - criteriaWidth - requirementWidth;
    const toolWidth = Math.max(25, Math.min(40, availableWidth / tools.length));
    const tableWidth = criteriaWidth + requirementWidth + (toolWidth * tools.length);

    // Draw table headers
    currentY = drawTableHeaders(pdf, tools, currentY, {
      criteriaWidth,
      requirementWidth,
      toolWidth,
      tableWidth
    });

    // Draw rows
    currentY = drawTableRows(pdf, tools, criteria, currentY, {
      criteriaWidth,
      requirementWidth,
      toolWidth,
      tableWidth
    });

    return currentY + 20;
  } catch (error) {
    console.error('Error in addComparisonTable:', error);
    throw new Error('Failed to generate comparison table');
  }
};

const drawTableHeaders = (
  pdf: jsPDF,
  tools: Tool[],
  startY: number,
  dimensions: {
    criteriaWidth: number;
    requirementWidth: number;
    toolWidth: number;
    tableWidth: number;
  }
) => {
  const { criteriaWidth, requirementWidth, toolWidth, tableWidth } = dimensions;
  const headerHeight = 30;
  let xPos = MARGIN;
  let currentY = startY;

  try {
    // Header background
    pdf.setFillColor(245, 247, 250);
    pdf.rect(MARGIN, currentY - 5, tableWidth, headerHeight + 5, 'F');

    // Criteria header
    drawTableCell(pdf, 'Criteria', xPos, currentY - 5, criteriaWidth, headerHeight, {
      bold: true,
      align: 'left'
    });
    xPos += criteriaWidth;

    // Required header
    drawTableCell(pdf, 'Required', xPos, currentY - 5, requirementWidth, headerHeight, {
      bold: true,
      align: 'center'
    });
    xPos += requirementWidth;

    // Tool headers
    tools.forEach(tool => {
      const truncatedName = tool.name.length > 15 ? tool.name.substring(0, 12) + '...' : tool.name;
      
      // Draw rotated header
      pdf.saveGraphicsState();
      const centerX = xPos + toolWidth/2;
      const centerY = currentY + headerHeight/2;
      pdf.translatePage(centerX, centerY);
      pdf.rotate(-45);
      
      const textWidth = pdf.getTextWidth(truncatedName);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(truncatedName, -textWidth/2, 0);
      
      pdf.restoreGraphicsState();
      
      // Draw cell border
      pdf.setDrawColor(...COLORS.GRAY);
      pdf.rect(xPos, currentY - 5, toolWidth, headerHeight);
      
      xPos += toolWidth;
    });

    return currentY + headerHeight + 5;
  } catch (error) {
    console.warn('Error drawing table headers:', error);
    return currentY + headerHeight + 5;
  }
};

const drawTableRows = (
  pdf: jsPDF,
  tools: Tool[],
  criteria: Criterion[],
  startY: number,
  dimensions: {
    criteriaWidth: number;
    requirementWidth: number;
    toolWidth: number;
    tableWidth: number;
  }
) => {
  const { criteriaWidth, requirementWidth, toolWidth, tableWidth } = dimensions;
  let currentY = startY;
  const rowHeight = 12;

  criteria.forEach((criterion, index) => {
    try {
      // Check for page break
      if (currentY > PAGE_HEIGHT - MARGIN - 30) {
        pdf.addPage();
        currentY = MARGIN + 10;
        
        // Redraw headers on new page
        currentY = drawTableHeaders(pdf, tools, currentY, dimensions);
      }

      let xPos = MARGIN;

      // Criterion name
      drawTableCell(pdf, criterion.name, xPos, currentY, criteriaWidth, rowHeight, {
        align: 'left'
      });
      xPos += criteriaWidth;

      // Required rating
      drawTableCell(pdf, `${criterion.userRating}/5`, xPos, currentY, requirementWidth, rowHeight, {
        align: 'center'
      });
      xPos += requirementWidth;

      // Tool ratings
      tools.forEach(tool => {
        // Use the enhanced getToolRating function to retrieve the correct rating
        const rating = getToolRating(tool, criterion.id);
        console.log(`Comparison Table - Tool: ${tool.name}, Criterion: ${criterion.name} (${criterion.id}), Rating: ${rating}`);
        
        const textColor = rating > criterion.userRating ? COLORS.GREEN :
                         rating === criterion.userRating ? COLORS.GRAY :
                         COLORS.RED;

        drawTableCell(pdf, `${rating}/5`, xPos, currentY, toolWidth, rowHeight, {
          align: 'center',
          textColor
        });
        xPos += toolWidth;
      });

      currentY += rowHeight;
    } catch (error) {
      console.warn(`Error drawing row for criterion ${criterion.name}:`, error);
      currentY += rowHeight;
    }
  });

  return currentY;
};