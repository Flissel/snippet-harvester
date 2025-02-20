
export type PromptType = 'yml_maker' | 'import_analyzer' | 'component_builder' | 'code_merger';

export interface AnalysisSession {
  id: string;
  snippet_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: string;
  current_step: number;
  metadata: Record<string, any>;
}

export interface AnalysisResult {
  id: string;
  session_id: string;
  prompt_id: string;
  step_number: number;
  result_data: Record<string, any>;
  created_at: string;
}

export interface AnalysisStep {
  step: number;
  type: PromptType;
  prompt: string;
  name: string;
  description: string;
}
