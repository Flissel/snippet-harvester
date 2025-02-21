
import { SelectedWorkflowItem } from '@/types/workflow';
import { ResponseSection } from './hooks/useYMLMaker';

export interface AnalysisResult {
  step_number: number;
  result_data: any;
  created_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  title?: string;
}

export interface YMLMakerProps {
  snippetId: string;
}

export interface SidebarProps {
  selectedItems: SelectedWorkflowItem[];
  onRemoveItem: (index: number) => void;
  onTestItem: (item: SelectedWorkflowItem) => Promise<void>;
  analysisResponse: any;
  isLoadingResponse: boolean;
  currentStep: number;
  workflowResults: AnalysisResult[];
  results: any[];
  isSingleExecution: boolean;
  sections: ResponseSection[];
}
