// Predefined color pairs for tools (background, border)
export const toolColors = [
  ['rgba(220, 38, 38, 0.2)', 'rgba(220, 38, 38, 1)'],      // Red
  ['rgba(37, 99, 235, 0.2)', 'rgba(37, 99, 235, 1)'],      // Blue
  ['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 1)'],      // Yellow
  ['rgba(147, 51, 234, 0.2)', 'rgba(147, 51, 234, 1)'],    // Purple
  ['rgba(236, 72, 153, 0.2)', 'rgba(236, 72, 153, 1)'],    // Pink
  ['rgba(20, 184, 166, 0.2)', 'rgba(20, 184, 166, 1)'],    // Teal
  ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 1)'],    // Amber
  ['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 1)'],      // Cyan
  ['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 1)'],    // Violet
  ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 1)'],    // Emerald
];

export const getToolColor = (index: number): [string, string] => {
  return toolColors[index % toolColors.length];
};