import { Tool, Criterion } from '../../types';
import { getToolColor } from '../chartColors';

// Helper function to get tool rating for a criterion
const getToolRating = (tool: Tool, criterion: Criterion): number => {
  try {
    // First try to find the criterion in the tool's criteria array by ID
    if (Array.isArray(tool.criteria)) {
      const criterionDataById = tool.criteria.find(c => 
        c.id === criterion.id
      );
      if (criterionDataById && typeof criterionDataById.ranking === 'number') {
        return criterionDataById.ranking;
      }
      
      // Or by name
      const criterionDataByName = tool.criteria.find(c => 
        c.name === criterion.name
      );
      if (criterionDataByName && typeof criterionDataByName.ranking === 'number') {
        return criterionDataByName.ranking;
      }
      
      // Case-insensitive name match as a fallback
      const criterionByLowerName = tool.criteria.find(c => 
        c.name && criterion.name && 
        c.name.toLowerCase() === criterion.name.toLowerCase()
      );
      if (criterionByLowerName && typeof criterionByLowerName.ranking === 'number') {
        return criterionByLowerName.ranking;
      }
    }

    // Next try to get rating from ratings object using criterion ID
    if (tool.ratings && typeof tool.ratings[criterion.id] === 'number') {
      return tool.ratings[criterion.id];
    }
    
    // Special case for specific criterion IDs in the rating object
    const criterionMappings: Record<string, string[]> = {
      'scalability': ['Scalability', 'scalability'],
      'integrations': ['Integrations & Extensibility', 'integrations', 'Integrations'],
      'easeOfUse': ['Ease of Use', 'easeOfUse', 'ease_of_use', 'ease-of-use'],
      'flexibility': ['Flexibility & Customization', 'flexibility', 'customization'],
      'ppmFeatures': ['Project Portfolio Management', 'ppmFeatures', 'ppm_features', 'ppm'],
      'reporting': ['Reporting & Analytics', 'reporting', 'analytics'],
      'security': ['Security & Compliance', 'security', 'compliance']
    };
    
    // Try all possible criterion keys
    const possibleKeys = criterionMappings[criterion.id] || [criterion.name, criterion.id];
    
    for (const key of possibleKeys) {
      if (tool.ratings && typeof tool.ratings[key] === 'number') {
        return tool.ratings[key];
      }
    }
    
    // Check the ratings object with case-insensitive keys
    if (tool.ratings) {
      const criterionNameLower = criterion.name.toLowerCase();
      const matchingKey = Object.keys(tool.ratings).find(key => 
        key.toLowerCase() === criterionNameLower || 
        key.toLowerCase() === criterion.id.toLowerCase()
      );
      
      if (matchingKey && typeof tool.ratings[matchingKey] === 'number') {
        return tool.ratings[matchingKey];
      }
    }

    // Default to 0 if not found
    return 0;
  } catch (error) {
    console.error(`Error getting rating for criterion ${criterion.name}:`, error);
    return 0;
  }
};

export const createRadarChart = (
  tool: Tool,
  selectedCriteria: Criterion[],
  canvas: HTMLCanvasElement,
  isComparison: boolean = false
) => {
  const ctx = canvas.getContext('2d')!;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;

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
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelX = centerX + Math.cos(angle) * (radius + 20);
    const labelY = centerY + Math.sin(angle) * (radius + 20);
    ctx.fillText(criterion.name, labelX, labelY);
  });

  // Draw concentric circles
  for (let i = 2; i <= 10; i += 2) {
    const r = (radius * i) / 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
  }

  // Draw data points
  const drawDataPoints = (data: number[], color: string, isDashed: boolean = false) => {
    ctx.beginPath();
    selectedCriteria.forEach((criterion, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = data[i];
      const r = (radius * value) / 10;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
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

  // Draw tool data
  if (isComparison) {
    // Draw user requirements
    drawDataPoints(
      selectedCriteria.map(c => c.userRating),
      'rgba(34, 197, 94, 1)',
      true
    );
  }

  // Draw tool data
  const [, borderColor] = getToolColor(0);
  drawDataPoints(
    selectedCriteria.map(criterion => getToolRating(tool, criterion)),
    borderColor
  );
};