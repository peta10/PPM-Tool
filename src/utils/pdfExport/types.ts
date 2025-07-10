import { Tool, Criterion } from '../../types';

export interface PDFSection {
  addToDocument: (pdf: jsPDF, tools: Tool[], criteria: Criterion[]) => Promise<void>;
}

export interface PDFOptions {
  filename?: string;
  pageSize?: 'a4' | 'letter';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ChartOptions {
  width: number;
  height: number;
  center?: boolean;
}

export interface TableColumn {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}