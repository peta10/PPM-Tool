import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Tool, Criterion } from '../../../types';
import { MARGIN, CONTENT_WIDTH, COLORS, FONT_SIZES } from '../constants';
import { calculateToolScore, getTopPerformerStrengths, getToolTagsByType, getToolRating, getToolMethodologies, getToolFunctions } from '../utils';

export const addExecutiveSummary = async (
  pdf: jsPDF,
  tools: Tool[],
  criteria: Criterion[]
) => {
  let currentY = MARGIN;

  try {
    // Section header
    pdf.setTextColor(...COLORS.INDIGO);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.TITLE);
    pdf.text('1. Executive Summary', MARGIN, currentY);

    currentY += 15;
    pdf.setTextColor(...COLORS.GRAY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(FONT_SIZES.BODY);

    // Calculate key metrics
    const sortedTools = [...tools].sort((a, b) => calculateToolScore(b, criteria) - calculateToolScore(a, criteria));
    const highScoringTools = tools.filter(t => calculateToolScore(t, criteria) >= 8).length;
    
    const allMethodologies = new Set<string>();
    const allFunctions = new Set<string>();
    
    // Gather all methodologies and functions
    tools.forEach(tool => {
      const methodologies = getToolMethodologies(tool);
      const functions = getToolFunctions(tool);
      
      methodologies.forEach(m => allMethodologies.add(m));
      functions.forEach(f => allFunctions.add(f));
    });
    
    const topTool = sortedTools.length > 0 ? sortedTools[0] : null;
    const topPerformerStrengths = topTool ? getTopPerformerStrengths(topTool, criteria) : 'N/A';

    // Format text with proper line breaks
    const summaryText = [
      'This report provides a comprehensive analysis of Project Portfolio Management (PPM) tools based on your specific requirements across seven critical evaluation criteria: Scalability, Integrations & Extensibility, Ease of Use, Flexibility & Customization, Project Portfolio Management Features, Reporting & Analytics, and Security & Compliance.',
      '',
      `The analysis evaluates ${tools.length} industry-leading tools including ${tools.slice(0, 3).map(t => t.name).join(', ')}, and others. Each tool has been assessed against your specified requirements using a sophisticated scoring system that measures both basic compliance and the degree to which tools exceed your needs.`,
      '',
      'Key Findings',
      `• ${tools.length} tools evaluated against ${criteria.length} criteria`,
      `• Top performing tool: ${topTool?.name || 'N/A'}`,
      '• Evaluation based on match scores that compare tool capabilities against your requirements',
      `• ${highScoringTools} tools achieved high match scores (8+/10)`,
      `• Key strengths of top performers: ${topPerformerStrengths}`
    ];

    // Add text with proper line wrapping
    for (const text of summaryText) {
      // Check if we need a new page
      if (currentY > 270) {
        pdf.addPage();
        currentY = MARGIN;
      }

      // Set bold for "Key Findings"
      if (text === 'Key Findings') {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }

      // Split text into lines that fit within the content width
      const lines = pdf.splitTextToSize(text, CONTENT_WIDTH);
      
      // Add each line
      for (const line of lines) {
        pdf.text(line, MARGIN, currentY);
        currentY += 8;
      }

      // Add extra spacing after paragraphs
      if (text === '') {
        currentY += 4;
      } else if (text === 'Key Findings') {
        currentY += 8;
      }
    }

    // Add key criteria overview
    currentY += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Criteria Requirements', MARGIN, currentY);
    currentY += 10;

    pdf.setFont('helvetica', 'normal');
    const highRankedCriteria = [...criteria]
      .filter(c => c.userRating >= 4)
      .sort((a, b) => b.userRating - a.userRating);

    if (highRankedCriteria.length > 0) {
      for (const criterion of highRankedCriteria.slice(0, 3)) {
        const toolRating = topTool ? getToolRating(topTool, criterion.id) : 0;
        const line = `• ${criterion.name} (${criterion.userRating}/5): ${
          topTool ? `${topTool.name} scores ${toolRating}/5` : 'Critical requirement'
        }`;
        
        const lines = pdf.splitTextToSize(line, CONTENT_WIDTH - 10);
        for (const textLine of lines) {
          pdf.text(textLine, MARGIN, currentY);
          currentY += 8;
        }
      }
    } else {
      pdf.text('• No high-priority criteria specified', MARGIN, currentY);
      currentY += 8;
    }

    // Add recommendations preview
    if (currentY > 200) {
      pdf.addPage();
      currentY = MARGIN;
    }

    // Capture and add recommendations section
    try {
      const recsElement = document.getElementById('recommendation-content');
      if (recsElement) {
        const recsCanvas = await html2canvas(recsElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const recsAspectRatio = recsCanvas.height / recsCanvas.width;
        const recsWidth = CONTENT_WIDTH;
        const recsHeight = recsWidth * recsAspectRatio;

        pdf.addImage(
          recsCanvas.toDataURL('image/png'),
          'PNG',
          MARGIN,
          currentY,
          recsWidth,
          recsHeight
        );
      }
    } catch (error) {
      console.warn('Failed to capture recommendations:', error);
      // Continue without the image, not critical
    }
  } catch (error) {
    console.error('Error in executive summary:', error);
    throw new Error('Failed to generate executive summary');
  }
};