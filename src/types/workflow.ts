
export interface WorkflowSession {
  id: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface WorkflowItem {
  id: string;
  workflow_session_id: string;
  snippet_id: string;
  prompt_id: string;
  order_index: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
