// Page dimensions (A4)
export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN = 20;
export const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

// Colors (RGB format for jsPDF)
export const COLORS = {
  INDIGO: [79, 70, 229],
  GRAY: [75, 85, 99],
  GREEN: [34, 197, 94],
  RED: [239, 68, 68],
  WHITE: [255, 255, 255]
} as const;

// Font sizes
export const FONT_SIZES = {
  TITLE: 24,
  SUBTITLE: 18,
  HEADING: 14,
  BODY: 12,
  SMALL: 10
} as const;

// Line heights
export const LINE_HEIGHTS = {
  TITLE: 20,
  SUBTITLE: 15,
  HEADING: 12,
  BODY: 8,
  SMALL: 6
} as const;