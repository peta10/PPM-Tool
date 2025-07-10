import { jsPDF } from 'jspdf';
import { MARGIN, PAGE_HEIGHT, PAGE_WIDTH, CONTENT_WIDTH, INDIGO, GRAY } from './constants';

interface TextStyle {
  color: number[];
  font: 'normal' | 'bold';
  size: number;
}

export class PDFDocument {
  private pdf: jsPDF;
  private currentY: number;
  private lineHeight: number;
  private paragraphSpacing: number;
  private style: TextStyle;

  constructor() {
    this.pdf = new jsPDF();
    this.currentY = MARGIN;
    this.lineHeight = 8;
    this.paragraphSpacing = 12;
    this.style = {
      color: GRAY,
      font: 'normal',
      size: 12
    };
  }

  private get remainingHeight(): number {
    return PAGE_HEIGHT - MARGIN - this.currentY;
  }

  checkPageBreak(requiredHeight: number): void {
    if (this.remainingHeight < requiredHeight) {
      this.addPage();
    }
  }

  addPage(): void {
    this.pdf.addPage();
    this.currentY = MARGIN;
  }

  setStyle(style: Partial<TextStyle>): void {
    this.style = { ...this.style, ...style };
    this.pdf.setTextColor(...this.style.color);
    this.pdf.setFont('helvetica', this.style.font);
    this.pdf.setFontSize(this.style.size);
  }

  addSpacing(amount: number): void {
    this.currentY += amount;
    if (this.currentY > PAGE_HEIGHT - MARGIN) {
      this.addPage();
    }
  }

  addText(text: string, indent: number = 0): void {
    const lines = this.pdf.splitTextToSize(text, CONTENT_WIDTH - indent);
    
    // Check if entire text block will fit
    const totalHeight = lines.length * this.lineHeight;
    this.checkPageBreak(totalHeight);
    
    lines.forEach(line => {
      this.pdf.text(line, MARGIN + indent, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    // Add paragraph spacing
    this.currentY += this.paragraphSpacing - this.lineHeight;
  }

  addHeading(text: string, level: 1 | 2 | 3 = 1): void {
    const sizes = { 1: 24, 2: 18, 3: 14 };
    const spacing = { 1: 20, 2: 15, 3: 12 };
    
    this.checkPageBreak(spacing[level] + this.lineHeight);
    
    this.setStyle({
      color: level === 1 ? INDIGO : GRAY,
      font: 'bold',
      size: sizes[level]
    });
    
    this.addText(text);
    this.currentY += spacing[level] - this.lineHeight; // Subtract lineHeight since addText already added it
  }

  addImage(
    imageData: string,
    width: number,
    height: number,
    options: { center?: boolean } = {}
  ): void {
    this.checkPageBreak(height + 20);

    const x = options.center ? 
      MARGIN + (CONTENT_WIDTH - width) / 2 : 
      MARGIN;

    this.pdf.addImage(imageData, 'PNG', x, this.currentY, width, height);
    this.currentY += height + 20;
  }

  addList(items: string[], indent: number = 10): void {
    items.forEach((item, index) => {
      // Check if this item will fit
      this.checkPageBreak(this.lineHeight + (index === 0 ? 0 : this.paragraphSpacing));
      
      if (index > 0) {
        this.currentY += this.paragraphSpacing;
      }
      
      this.addText(item, indent);
    });
  }

  addSection(title: string, content: () => void): void {
    // Ensure we have enough space for at least the title and one line
    this.checkPageBreak(30);
    
    // Add section title
    this.setStyle({
      color: INDIGO,
      font: 'bold',
      size: 14
    });
    
    this.addText(title);
    this.currentY += 5;
    
    // Reset style for content
    this.setStyle({
      color: GRAY,
      font: 'normal',
      size: 12
    });
    
    content();
    
    // Add some spacing after the section
    this.currentY += this.paragraphSpacing;
  }

  addTable(
    headers: string[],
    rows: string[][],
    columnWidths: number[]
  ): void {
    const rowHeight = 12;
    const tableHeight = (rows.length + 1) * rowHeight;
    
    this.checkPageBreak(tableHeight);
    
    let x = MARGIN;
    
    // Headers
    this.setStyle({ font: 'bold' });
    headers.forEach((header, i) => {
      this.pdf.text(header, x, this.currentY);
      x += columnWidths[i];
    });
    
    this.currentY += rowHeight;
    
    // Rows
    this.setStyle({ font: 'normal' });
    rows.forEach(row => {
      // Check if this row will fit
      this.checkPageBreak(rowHeight);
      
      x = MARGIN;
      row.forEach((cell, i) => {
        this.pdf.text(cell, x, this.currentY);
        x += columnWidths[i];
      });
      this.currentY += rowHeight;
    });
  }

  save(filename: string): void {
    this.pdf.save(filename);
  }

  getPDF(): jsPDF {
    return this.pdf;
  }
}