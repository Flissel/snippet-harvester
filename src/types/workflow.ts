
export interface WorkflowSession {
  id: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  name: string;
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
}
