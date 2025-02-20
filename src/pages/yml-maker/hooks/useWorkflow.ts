
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowSession, WorkflowItem } from '@/types/workflow';

export function useWorkflow() {
  const [selectedItems, setSelectedItems] = useState<Array<{
    title: string;
    description?: string;
    workflow_type: string;
  }>>([]);
  const queryClient = useQueryClient();

  // Create workflow session
  const createSession = useMutation({
    mutationFn: async (name: string = 'New Workflow') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflow_sessions')
        .insert({
          created_by: user.id,
          status: 'pending',
          name,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowSession;
    },
  });

  // Add workflow item
  const addWorkflowItem = useMutation({
    mutationFn: async ({ 
      sessionId, 
      title,
      description,
      workflowType,
      orderIndex 
    }: {
      sessionId: string;
      title: string;
      description?: string;
      workflowType: string;
      orderIndex: number;
    }) => {
      const { data, error } = await supabase
        .from('workflow_items')
        .insert({
          workflow_session_id: sessionId,
          title,
          description,
          workflow_type: workflowType,
          order_index: orderIndex,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowItem;
    },
  });

  // Start workflow execution
  const executeWorkflow = async (sessionId: string) => {
    try {
      // Update session status
      await supabase
        .from('workflow_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);

      // Process each item in sequence
      for (const [index, item] of selectedItems.entries()) {
        // Create workflow item if it doesn't exist
        const { data: workflowItem } = await addWorkflowItem.mutateAsync({
          sessionId,
          title: item.title,
          description: item.description,
          workflowType: item.workflow_type,
          orderIndex: index,
        });

        // Update item status
        await supabase
          .from('workflow_items')
          .update({ status: 'in_progress' })
          .eq('id', workflowItem.id);

        // Execute analysis
        const result = await supabase.functions.invoke('execute-analysis-step', {
          body: {
            workflowItemId: workflowItem.id,
            step: index + 1,
          },
        });

        // Update item with results
        await supabase
          .from('workflow_items')
          .update({
            status: 'completed',
            result_data: result.data,
          })
          .eq('id', workflowItem.id);

        queryClient.invalidateQueries({ queryKey: ['workflow-items'] });
      }

      // Update session status to completed
      await supabase
        .from('workflow_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      toast.success('Workflow completed successfully');
    } catch (error) {
      toast.error('Error executing workflow: ' + (error as Error).message);
      await supabase
        .from('workflow_sessions')
        .update({ status: 'failed' })
        .eq('id', sessionId);
    }
  };

  const addItem = (title: string, description?: string, workflowType: string = 'generic') => {
    setSelectedItems(prev => [...prev, { title, description, workflow_type: workflowType }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  return {
    selectedItems,
    addItem,
    removeItem,
    createSession,
    addWorkflowItem,
    executeWorkflow,
  };
}
