
import { useState } from 'react';
import { SelectedWorkflowItem } from '@/types/workflow';
import { useWorkflowMutations } from './workflow/useWorkflowMutations';
import { useWorkflowExecution } from './workflow/useWorkflowExecution';

export function useWorkflow() {
  const [selectedItems, setSelectedItems] = useState<SelectedWorkflowItem[]>([]);
  const { createSession, addWorkflowItem } = useWorkflowMutations();
  const { executeSingleItem, executeWorkflow } = useWorkflowExecution();

  const addItem = (
    title: string, 
    description: string | undefined, 
    workflowType: string = 'generic',
    snippetId: string,
    analysisType?: string,
    systemMessage?: string,
    userMessage?: string,
    model?: string
  ) => {
    setSelectedItems(prev => [...prev, { 
      title, 
      description, 
      workflow_type: workflowType,
      snippet_id: snippetId,
      analysis_type: analysisType,
      system_message: systemMessage,
      user_message: userMessage,
      model: model
    }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleExecuteWorkflow = async (sessionId: string) => {
    await executeWorkflow(sessionId, selectedItems);
  };

  return {
    selectedItems,
    addItem,
    removeItem,
    createSession,
    addWorkflowItem,
    executeWorkflow: handleExecuteWorkflow,
    executeSingleItem,
  };
}
