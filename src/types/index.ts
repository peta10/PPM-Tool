export interface Criterion {
  id: string;
  name: string;
  description: string;
  userRating: number;
  ratingDescriptions: {
    low: string;
    high: string;
  };
}

export interface CriteriaRating {
  id: string;
  name: string;
  ranking: number;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  type: string;
}

export interface Tool {
  id: string;
  name: string;
  logo: string;
  useCases: string[];
  methodologies: string[];
  functions: string[];
  ratings: Record<string, number>;
  ratingExplanations: Record<string, string>;
  type: string;
  created_by: string | null;
  criteria: CriteriaRating[];
  tags: Tag[];
  created_on: string;
  updated_at?: string;
  submitted_at?: string;
  approved_at?: string;
  submission_status: string;
  removed?: boolean;
}

export interface ComparisonState {
  selectedCriteria: Criterion[];
  selectedTools: Tool[];
}