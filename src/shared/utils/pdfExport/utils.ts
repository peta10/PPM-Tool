import { Tool, Criterion } from '../../types';
import { jsPDF } from 'jspdf';

export const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getToolRating = (tool: Tool, criterionId: string | Criterion): number => {
  try {
    // Handle when a Criterion object is passed
    let criterion: Criterion | null = null;
    let id: string = '';
    
    if (typeof criterionId === 'object' && criterionId !== null) {
      criterion = criterionId;
      id = criterion.id;
    } else {
      id = criterionId;
    }
    
    // First check if we have a criterion with a matching ID in the tool's criteria array
    if (Array.isArray(tool.criteria)) {
      // Look for criterion by ID
      const criterionDataById = tool.criteria.find(c => 
        c.id === id
      );
      if (criterionDataById && typeof criterionDataById.ranking === 'number') {
        return criterionDataById.ranking;
      }
      
      // Or by name if we have the criterion object
      if (criterion) {
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
    }

    // Next try the ratings object with the ID
    if (tool.ratings && typeof tool.ratings[id] === 'number') {
      return tool.ratings[id];
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
    const possibleKeys = criterionMappings[id] || (criterion ? [criterion.name, id] : [id]);
    
    for (const key of possibleKeys) {
      if (tool.ratings && typeof tool.ratings[key] === 'number') {
        return tool.ratings[key];
      }
    }

    // Try case-insensitive name match in the ratings object
    if (tool.ratings) {
      const criterionNameLower = criterion ? criterion.name.toLowerCase() : '';
      const idLower = id.toLowerCase();
      
      const matchingKey = Object.keys(tool.ratings).find(key => 
        key.toLowerCase() === idLower || 
        (criterionNameLower && key.toLowerCase() === criterionNameLower)
      );
      
      if (matchingKey && typeof tool.ratings[matchingKey] === 'number') {
        return tool.ratings[matchingKey];
      }
    }

    console.warn(`No rating found for criterion ${criterion ? criterion.name : id} in tool ${tool.name}`);
    return 0;
  } catch (error) {
    console.warn(`Error getting rating for criterion ${criterionId}:`, error);
    return 0;
  }
};

export const calculateToolScore = (tool: Tool, criteria: Criterion[]): number => {
  try {
    let totalScore = 0;
    let validCriteriaCount = 0;
    let meetsAllCriteria = true;
    
    criteria.forEach((criterion) => {
      const toolRating = getToolRating(tool, criterion);
      const userRating = criterion.userRating;
      
      // Check if tool meets or exceeds requirement
      if (toolRating < userRating) {
        meetsAllCriteria = false;
      }
      
      if (toolRating > 0) {
        validCriteriaCount++;
        totalScore += toolRating >= userRating ? 10 : 10 - (userRating - toolRating);
      }
    });
    
    // Calculate average score
    let finalScore = validCriteriaCount > 0 ? totalScore / validCriteriaCount : 0;
    
    // If tool meets or exceeds ALL criteria, it gets a perfect 10
    if (meetsAllCriteria && validCriteriaCount === criteria.length) {
      finalScore = 10;
    }
    
    return finalScore;
  } catch (error) {
    console.warn('Error calculating tool score:', error);
    return 0;
  }
};

export const getTopPerformerStrengths = (tool: Tool, criteria: Criterion[]): string => {
  try {
    if (!tool) return 'N/A';

    const strengths = criteria
      .filter(c => {
        const rating = getToolRating(tool, c);
        return rating >= 4;
      })
      .map(c => c.name);
    
    return strengths.length > 0 ? strengths.join(', ') : 'N/A';
  } catch (error) {
    console.warn('Error getting top performer strengths:', error);
    return 'N/A';
  }
};

export const addPageNumbers = (pdf: jsPDF) => {
  try {
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        180,
        287
      );
    }
  } catch (error) {
    console.warn('Error adding page numbers:', error);
  }
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const validatePDFInput = (tools: Tool[], criteria: Criterion[]) => {
  if (!Array.isArray(tools) || !Array.isArray(criteria)) {
    throw new Error('Invalid tools or criteria array');
  }
  if (tools.length === 0 || criteria.length === 0) {
    throw new Error('At least one tool and criterion required');
  }
  
  // Validate tool structure
  tools.forEach((tool, index) => {
    if (!tool || typeof tool !== 'object') {
      throw new Error(`Invalid tool at index ${index}`);
    }
    if (!tool.id || !tool.name) {
      throw new Error(`Tool at index ${index} missing required fields`);
    }
  });

  // Validate criteria structure
  criteria.forEach((criterion, index) => {
    if (!criterion || typeof criterion !== 'object') {
      throw new Error(`Invalid criterion at index ${index}`);
    }
    if (!criterion.id || !criterion.name) {
      throw new Error(`Criterion at index ${index} missing required fields`);
    }
    if (typeof criterion.userRating !== 'number' || criterion.userRating < 1 || criterion.userRating > 5) {
      throw new Error(`Invalid user rating for criterion at index ${index}`);
    }
  });
};

// Helper function to get tool tags by type
export const getToolTagsByType = (tool: Tool, type: string): string[] => {
  try {
    if (!tool || !Array.isArray(tool.tags)) return [];
    
    return tool.tags
      .filter(tag => tag && typeof tag === 'object' && tag.type === type)
      .map(tag => tag.name)
      .filter(Boolean);
  } catch (error) {
    console.warn(`Error getting ${type} tags:`, error);
    return [];
  }
};

// Helper function to get tool methodologies
export const getToolMethodologies = (tool: Tool): string[] => {
  // First try direct methodologies array
  if (Array.isArray(tool.methodologies)) {
    return tool.methodologies;
  }
  return getToolTagsByType(tool, 'Methodology');
};

// Helper function to get tool functions
export const getToolFunctions = (tool: Tool): string[] => {
  // First try direct functions array
  if (Array.isArray(tool.functions)) {
    return tool.functions;
  }
  return getToolTagsByType(tool, 'Function');
};

// Helper function to get tool description
export const getToolDescription = (tool: Tool, criterionId: string): string => {
  try {
    if (Array.isArray(tool.criteria)) {
      const criterionData = tool.criteria.find(c => 
        c && typeof c === 'object' && 
        (c.id === criterionId || c.name === criterionId)
      );
      if (criterionData && typeof criterionData.description === 'string') {
        return criterionData.description;
      }
    }

    if (tool.ratingExplanations && typeof tool.ratingExplanations[criterionId] === 'string') {
      return tool.ratingExplanations[criterionId];
    }

    return '';
  } catch (error) {
    console.warn(`Error getting description for criterion ${criterionId}:`, error);
    return '';
  }
};

// Debug helper to log tool data
export const debugLogTool = (tool: Tool) => {
  try {
    console.log('Tool Debug Info:', {
      name: tool.name,
      id: tool.id,
      hasRatings: !!tool.ratings,
      hasCriteria: Array.isArray(tool.criteria),
      criteriaCount: Array.isArray(tool.criteria) ? tool.criteria.length : 0,
      sampleRating: tool.ratings?.scalability || tool.ratings?.['Scalability'] || 'N/A'
    });
  } catch (error) {
    console.warn('Error logging tool debug info:', error);
  }
};