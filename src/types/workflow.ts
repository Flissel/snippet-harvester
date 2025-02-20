
export interface WorkflowSession {
  id: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  name: string;
  snippet_id?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowItem {
  id: string;
  workflow_session_id: string;
  title: string;
  description?: string;
  workflow_type: string;
  order_index: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  snippet_id: string;
  analysis_type?: string;
  metadata?: Record<string, any>;
  system_message?: string;
  user_message?: string;
  model?: string;
}

export interface SelectedWorkflowItem {
  title: string;
  description?: string;
  workflow_type: string;
  snippet_id: string;
  analysis_type?: string;
  system_message?: string;
  user_message?: string;
  model?: string;
}
