import { jsPDF } from 'jspdf';
import { Tool, Criterion } from '../../../types';
import { PAGE_WIDTH, MARGIN, COLORS, FONT_SIZES } from '../constants';
import { formatDate } from '../utils';

export const addCoverPage = (pdf: jsPDF) => {
  // Header background
  pdf.setFillColor(...COLORS.INDIGO);
  pdf.rect(0, 0, PAGE_WIDTH, 60, 'F');
  
  // Title
  pdf.setTextColor(...COLORS.WHITE);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZES.TITLE);
  pdf.text('PPM Tool Comparison Report', MARGIN, 40);

  // Date
  pdf.setFontSize(FONT_SIZES.BODY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(), MARGIN, 50);

  // Table of Contents
  let currentY = 100;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZES.SUBTITLE);
  pdf.text('Contents', MARGIN, currentY);

  currentY += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(FONT_SIZES.BODY);
  pdf.setTextColor(...COLORS.GRAY);

  const tocItems = [
    '1. Executive Summary',
    '2. Tool Comparison Analysis',
    '3. Detailed Tool Rankings & Recommendations'
  ];

  tocItems.forEach(item => {
    pdf.text(item, MARGIN, currentY);
    currentY += 10;
  });
};