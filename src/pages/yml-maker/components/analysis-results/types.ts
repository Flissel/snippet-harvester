
export interface AnalysisResult {
  step_number: number;
  result_data: any;
  created_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  title?: string;
}

export interface AnalysisResultsProps {
  currentStep: number;
  results?: AnalysisResult[];
  isSingleExecution?: boolean;
}

export interface ResultSection {
  title: string;
  content: string;
  language: string;
}
