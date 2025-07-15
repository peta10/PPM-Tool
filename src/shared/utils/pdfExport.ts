import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Tool, Criterion } from '../types';
import { addCoverPage } from './pdfExport/sections/coverPage';
import { addExecutiveSummary } from './pdfExport/sections/executiveSummary';
import { addComparisonTable } from './pdfExport/sections/comparisonTable';
import { addRadarChartSection } from './pdfExport/sections/radarCharts';
import { addDetailedRankings } from './pdfExport/sections/detailedRankings';
import { addPageNumbers, validatePDFInput, delay, debugLogTool } from './pdfExport/utils';

export const generateReport = async (
  tools: Tool[],
  criteria: Criterion[],
) => {
  try {
    // Validate inputs first
    validatePDFInput(tools, criteria);

    // Log first tool for debugging
    if (tools.length > 0) {
      console.log("Generating report with tools:");
      debugLogTool(tools[0]);
    }

    // Wait for any pending UI updates
    await delay(100);

    // Create new PDF document with error handling
    let pdf: jsPDF;
    try {
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
    } catch (error) {
      console.error('Failed to create PDF document:', error);
      throw new Error('Could not initialize PDF generation');
    }

    // Add cover page
    try {
      addCoverPage(pdf);
    } catch (error) {
      console.error('Error adding cover page:', error);
      throw new Error('Failed to add cover page');
    }

    // Add executive summary
    try {
      pdf.addPage();
      await addExecutiveSummary(pdf, tools, criteria);
    } catch (error) {
      console.error('Error adding executive summary:', error);
      throw new Error('Failed to add executive summary');
    }

    // Add comparison table
    try {
      pdf.addPage();
      const tableEndY = addComparisonTable(pdf, tools, criteria);

      // Add radar chart analysis
      await delay(100); // Wait for any canvas updates
      await addRadarChartSection(pdf, tools, criteria, tableEndY);
    } catch (error) {
      console.error('Error adding comparison section:', error);
      throw new Error('Failed to add comparison section');
    }

    // Add detailed rankings and recommendations
    try {
      pdf.addPage();
      addDetailedRankings(pdf, tools, criteria);
    } catch (error) {
      console.error('Error adding detailed rankings:', error);
      throw new Error('Failed to add detailed rankings');
    }

    // Add page numbers
    try {
      addPageNumbers(pdf);
    } catch (error) {
      console.error('Error adding page numbers:', error);
      // Continue without page numbers as this is not critical
    }

    // Save the PDF with error handling
    try {
      await delay(200); // Final delay to ensure all content is ready
      pdf.save('ppm-tool-comparison-report.pdf');
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF report');
    }

    console.log("PDF generation completed successfully");
  } catch (error) {
    // Log the full error for debugging
    console.error('Error generating PDF:', error);

    // Throw a user-friendly error
    if (error instanceof Error) {
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    } else {
      throw new Error('Failed to generate PDF report. Please try again.');
    }
  }
};

export * from './pdfExport/types';
export * from './pdfExport/constants';
export * from './pdfExport/utils';