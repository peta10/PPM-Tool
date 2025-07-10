import { jsPDF } from 'jspdf';
import { Tool, Criterion } from '../../../types';
import { MARGIN, PAGE_HEIGHT, CONTENT_WIDTH, COLORS, FONT_SIZES } from '../constants';
import { calculateToolScore, getTopPerformerStrengths, getToolRating, getToolTagsByType, getToolMethodologies, getToolFunctions } from '../utils';

const getToolUseCases = (tool: Tool): string => {
  // First check functions array if it exists
  if (Array.isArray(tool.functions) && tool.functions.length > 0) {
    return tool.functions.join(', ');
  }
  
  // Otherwise use the tag-based approach
  const functionTags = getToolTagsByType(tool, 'Function');
  return functionTags.length > 0 ? functionTags.join(', ') : 'N/A';
};

const addTextWithWrapping = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6
): number => {
  try {
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    for (const line of lines) {
      if (currentY > PAGE_HEIGHT - MARGIN - 20) {
        pdf.addPage();
        currentY = MARGIN;
      }
      pdf.text(line, x, currentY);
      currentY += lineHeight;
    }
    
    return currentY;
  } catch (error) {
    console.warn('Error adding wrapped text:', error);
    return y + lineHeight; // Return next line position even if error occurs
  }
};

export const addDetailedRankings = (
  pdf: jsPDF,
  selectedTools: Tool[],
  selectedCriteria: Criterion[]
) => {
  try {
    let currentY = MARGIN;

    // Section header
    pdf.setTextColor(...COLORS.INDIGO);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.TITLE);
    currentY = addTextWithWrapping(
      pdf,
      '3. Detailed Tool Rankings & Recommendations',
      MARGIN,
      currentY,
      CONTENT_WIDTH
    );

    currentY += 20;

    // Overall Rankings Table
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(FONT_SIZES.HEADING);
    currentY = addTextWithWrapping(
      pdf,
      'Overall Rankings',
      MARGIN,
      currentY,
      CONTENT_WIDTH
    );

    currentY += 10;

    // Sort tools by score
    const sortedTools = [...selectedTools]
      .filter(tool => tool && typeof tool === 'object')
      .sort((a, b) => {
        try {
          return calculateToolScore(b, selectedCriteria) - calculateToolScore(a, selectedCriteria);
        } catch {
          return 0;
        }
      });

    // Create tool breakdown table
    currentY = addToolBreakdownTable(pdf, sortedTools, selectedCriteria, currentY);
    currentY += 15;

    // Best Overall Match
    const bestTool = sortedTools[0];
    if (bestTool) {
      const bestScore = calculateToolScore(bestTool, selectedCriteria);
      const bestStrengths = getTopPerformerStrengths(bestTool, selectedCriteria);
      const bestUseCases = getToolUseCases(bestTool);
      const bestMethodologies = getToolMethodologies(bestTool).join(', ') || 'N/A';
      
      pdf.setFont('helvetica', 'bold');
      currentY = addTextWithWrapping(
        pdf,
        'Best Overall Match:',
        MARGIN,
        currentY,
        CONTENT_WIDTH
      );
      currentY += 7;
      
      pdf.setFont('helvetica', 'normal');
      const bestMatchText = [
        `${bestTool.name} (Match Score: ${bestScore.toFixed(1)}/10)`,
        `Key Strengths: ${bestStrengths}`,
        `Best suited for: ${bestUseCases}`,
        `Supported methodologies: ${bestMethodologies}`
      ];
      
      for (const line of bestMatchText) {
        currentY = addTextWithWrapping(
          pdf,
          line,
          MARGIN + 10,
          currentY,
          CONTENT_WIDTH - 20
        );
      }
    }

    currentY += 10;

    // Alternative Recommendations
    pdf.setFont('helvetica', 'bold');
    currentY = addTextWithWrapping(
      pdf,
      'Alternative Recommendations:',
      MARGIN,
      currentY,
      CONTENT_WIDTH
    );
    currentY += 7;

    // Get next 2 best tools
    const alternatives = sortedTools.slice(1, 3);
    
    for (const tool of alternatives) {
      if (!tool) continue;

      if (currentY > PAGE_HEIGHT - MARGIN - 30) {
        pdf.addPage();
        currentY = MARGIN;
      }

      const score = calculateToolScore(tool, selectedCriteria);
      const strengths = getTopPerformerStrengths(tool, selectedCriteria);
      const useCases = getToolUseCases(tool);
      const methodologies = getToolMethodologies(tool).join(', ') || 'N/A';

      pdf.setFont('helvetica', 'bold');
      currentY = addTextWithWrapping(
        pdf,
        `${tool.name} (Match Score: ${score.toFixed(1)}/10)`,
        MARGIN + 10,
        currentY,
        CONTENT_WIDTH - 20
      );
      currentY += 6;

      pdf.setFont('helvetica', 'normal');
      const alternativeText = [
        `Key Strengths: ${strengths}`,
        `Best suited for: ${useCases}`,
        `Supported methodologies: ${methodologies}`
      ];

      for (const text of alternativeText) {
        currentY = addTextWithWrapping(
          pdf,
          text,
          MARGIN + 10,
          currentY,
          CONTENT_WIDTH - 30
        );
      }

      currentY += 5;
    }

    currentY += 10;

    // Implementation Considerations
    pdf.setFont('helvetica', 'bold');
    currentY = addTextWithWrapping(
      pdf,
      'Implementation Considerations:',
      MARGIN,
      currentY,
      CONTENT_WIDTH
    );
    currentY += 10;

    pdf.setFont('helvetica', 'normal');
    
    // Generate dynamic considerations based on the actual tool ratings
    const considerations = [
      `Deployment Complexity: ${
        sortedTools.some(t => getToolRating(t, 'scalability') >= 4)
          ? 'Consider enterprise-grade deployment requirements and infrastructure needs.'
          : 'Plan for standard deployment and setup procedures.'
      }`,
      
      `Training Requirements: ${
        sortedTools.some(t => getToolRating(t, 'easeOfUse') <= 3)
          ? 'Comprehensive training program recommended due to complex features.'
          : 'Basic training should suffice for most users.'
      }`,
      
      `Integration Requirements: ${
        sortedTools.some(t => getToolRating(t, 'integrations') >= 4)
          ? 'Evaluate extensive integration capabilities with existing systems.'
          : 'Plan for basic system integrations.'
      }`,
      
      'Data Migration: Plan for migrating existing project data and historical information.',
      
      `Cost Considerations: ${
        sortedTools.some(t => 
          (getToolRating(t, 'scalability') >= 4) || 
          (getToolRating(t, 'integrations') >= 4) ||
          (getToolRating(t, 'ppmFeatures') >= 4)
        )
          ? 'Account for enterprise licensing, implementation services, and ongoing maintenance costs.'
          : 'Consider standard licensing and maintenance costs.'
      }`
    ];

    for (const item of considerations) {
      currentY = addTextWithWrapping(
        pdf,
        item,
        MARGIN + 10,
        currentY,
        CONTENT_WIDTH - 20
      );
      currentY += 4;
    }

    currentY += 10;

    // Next Steps
    pdf.setFont('helvetica', 'bold');
    currentY = addTextWithWrapping(
      pdf,
      'Recommended Next Steps:',
      MARGIN,
      currentY,
      CONTENT_WIDTH
    );
    currentY += 10;

    pdf.setFont('helvetica', 'normal');
    const nextSteps = [
      `1. Request detailed demos from top ${Math.min(3, sortedTools.length)} recommended tools`,
      
      sortedTools.some(t => getToolRating(t, 'integrations') >= 4)
        ? '2. Conduct thorough technical evaluation with IT team to assess integration requirements'
        : '2. Review basic technical requirements with IT team',
      
      sortedTools.some(t => getToolRating(t, 'easeOfUse') <= 3)
        ? '3. Run extended pilot program with selected team members'
        : '3. Conduct brief pilot testing with key users',
      
      '4. Gather feedback and adjust implementation plan accordingly',
      
      sortedTools.some(t => getToolRating(t, 'easeOfUse') <= 3)
        ? '5. Develop comprehensive training program and phased rollout strategy'
        : '5. Plan basic training sessions and prepare for deployment'
    ];

    for (const step of nextSteps) {
      currentY = addTextWithWrapping(
        pdf,
        step,
        MARGIN + 10,
        currentY,
        CONTENT_WIDTH - 20
      );
      currentY += 4;
    }

    return currentY;
  } catch (error) {
    console.error('Error in detailed rankings:', error);
    throw new Error('Failed to generate detailed rankings section');
  }
};

// Helper function to add a tool breakdown table
const addToolBreakdownTable = (
  pdf: jsPDF,
  tools: Tool[],
  criteria: Criterion[],
  startY: number
): number => {
  try {
    let currentY = startY;
    
    // Define column widths
    const nameWidth = 50;
    const scoreWidth = 25;
    const strengthsWidth = 55;
    const useCasesWidth = 50;
    const rowHeight = 12;
    
    // Headers
    pdf.setFillColor(245, 247, 250);
    pdf.rect(MARGIN, currentY, nameWidth + scoreWidth + strengthsWidth + useCasesWidth, rowHeight, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.GRAY);
    
    let x = MARGIN;
    pdf.text('Tool Name', x + 3, currentY + 8);
    x += nameWidth;
    
    pdf.text('Score', x + 3, currentY + 8);
    x += scoreWidth;
    
    pdf.text('Key Strengths', x + 3, currentY + 8);
    x += strengthsWidth;
    
    pdf.text('Best Use Cases', x + 3, currentY + 8);
    
    currentY += rowHeight;
    
    // Tool rows
    for (const tool of tools) {
      // Check if we need a new page
      if (currentY > PAGE_HEIGHT - MARGIN - 30) {
        pdf.addPage();
        currentY = MARGIN;
        
        // Redraw header on new page
        pdf.setFillColor(245, 247, 250);
        pdf.rect(MARGIN, currentY, nameWidth + scoreWidth + strengthsWidth + useCasesWidth, rowHeight, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        
        x = MARGIN;
        pdf.text('Tool Name', x + 3, currentY + 8);
        x += nameWidth;
        
        pdf.text('Score', x + 3, currentY + 8);
        x += scoreWidth;
        
        pdf.text('Key Strengths', x + 3, currentY + 8);
        x += strengthsWidth;
        
        pdf.text('Best Use Cases', x + 3, currentY + 8);
        
        currentY += rowHeight;
      }
      
      // Draw borders for this row
      pdf.setDrawColor(...COLORS.GRAY);
      pdf.rect(MARGIN, currentY, nameWidth, rowHeight);
      pdf.rect(MARGIN + nameWidth, currentY, scoreWidth, rowHeight);
      pdf.rect(MARGIN + nameWidth + scoreWidth, currentY, strengthsWidth, rowHeight);
      pdf.rect(MARGIN + nameWidth + scoreWidth + strengthsWidth, currentY, useCasesWidth, rowHeight);
      
      // Calculate values
      const score = calculateToolScore(tool, criteria);
      const strengths = getTopPerformerStrengths(tool, criteria);
      const useCases = getToolUseCases(tool);
      
      // Set colors based on score
      const scoreColor = score >= 8 ? COLORS.GREEN : 
                        score >= 6 ? COLORS.INDIGO : 
                        COLORS.GRAY;
      
      // Tool name (truncate if too long)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.GRAY);
      
      const truncatedName = tool.name.length > 20 ? tool.name.substring(0, 17) + '...' : tool.name;
      x = MARGIN;
      pdf.text(truncatedName, x + 3, currentY + 8);
      x += nameWidth;
      
      // Score
      pdf.setTextColor(...scoreColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${score.toFixed(1)}/10`, x + 3, currentY + 8);
      x += scoreWidth;
      
      // Key strengths (truncate if needed)
      pdf.setTextColor(...COLORS.GRAY);
      pdf.setFont('helvetica', 'normal');
      const truncatedStrengths = strengths.length > 30 ? strengths.substring(0, 27) + '...' : strengths;
      pdf.text(truncatedStrengths, x + 3, currentY + 8);
      x += strengthsWidth;
      
      // Use cases (truncate if needed)
      const truncatedUseCases = useCases.length > 30 ? useCases.substring(0, 27) + '...' : useCases;
      pdf.text(truncatedUseCases, x + 3, currentY + 8);
      
      currentY += rowHeight;
    }
    
    return currentY;
  } catch (error) {
    console.warn('Error creating tool breakdown table:', error);
    return startY + 10; // Return with minimal advancement in case of error
  }
};