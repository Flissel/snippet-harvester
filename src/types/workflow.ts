
export interface WorkflowSession {
  id: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  name: string;
  snippet_id?: string; // Optional to maintain backwards compatibility
  metadata?: Record<string, any>; // For future extensibility
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
  snippet_id: string; // Required field to track which snippet this item is analyzing
  analysis_type?: string; // Type of analysis being performed
  metadata?: Record<string, any>; // Additional metadata for future use
}

// Types for selected items in the workflow queue
export interface SelectedWorkflowItem {
  title: string;
  description?: string;
  workflow_type: string;
  snippet_id: string;
  analysis_type?: string;
}
