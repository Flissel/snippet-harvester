
import { SelectedWorkflowItem } from '@/types/workflow';
import { useWorkflowMutations } from './useWorkflowMutations';
import { useQueryClient } from '@tanstack/react-query';
import { executeSingleItem } from './utils/executeSingleItem';
import { executeWorkflow } from './utils/executeWorkflow';

export interface ExecutionLog {
  timestamp: string;
  functionId: string;
  message: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  event_message?: string;
  execution_time_ms?: number;
  request_data?: any;
  response_data?: any;
}

export function useWorkflowExecution() {
  const { createSession, addWorkflowItem } = useWorkflowMutations();
  const queryClient = useQueryClient();

  return {
    executeSingleItem: async (item: SelectedWorkflowItem, onLog?: (log: ExecutionLog) => void) => {
      return executeSingleItem(item, createSession, addWorkflowItem, queryClient, onLog);
    },
    executeWorkflow: async (sessionId: string, items: SelectedWorkflowItem[], onLog?: (log: ExecutionLog) => void) => {
      return executeWorkflow(sessionId, items, addWorkflowItem, queryClient, onLog);
    },
  };
}
