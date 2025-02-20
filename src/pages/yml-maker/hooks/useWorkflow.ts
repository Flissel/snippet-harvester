
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowSession, WorkflowItem, SelectedWorkflowItem } from '@/types/workflow';

export function useWorkflow() {
  const [selectedItems, setSelectedItems] = useState<SelectedWorkflowItem[]>([]);
  const queryClient = useQueryClient();

  // Create workflow session
  const createSession = useMutation({
    mutationFn: async ({ name = 'New Workflow', snippetId }: { name?: string, snippetId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflow_sessions')
        .insert({
          created_by: user.id,
          status: 'pending',
          name,
          snippet_id: snippetId,
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
      orderIndex,
      snippetId,
      analysisType 
    }: {
      sessionId: string;
      title: string;
      description?: string;
      workflowType: string;
      orderIndex: number;
      snippetId: string;
      analysisType?: string;
    }) => {
      const { data, error } = await supabase
        .from('workflow_items')
        .insert({
          workflow_session_id: sessionId,
          title,
          description,
          workflow_type: workflowType,
          order_index: orderIndex,
          status: 'pending',
          result_data: null,
          snippet_id: snippetId,
          analysis_type: analysisType
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
        console.log('Processing workflow item:', index + 1);

        // Create workflow item
        const workflowItem = await addWorkflowItem.mutateAsync({
          sessionId,
          title: item.title,
          description: item.description,
          workflowType: item.workflow_type,
          orderIndex: index,
          snippetId: item.snippet_id,
          analysisType: item.analysis_type
        });

        console.log('Created workflow item:', workflowItem.id);

        // Update item status to in_progress
        await supabase
          .from('workflow_items')
          .update({ status: 'in_progress' })
          .eq('id', workflowItem.id);

        try {
          // Execute analysis
          const { data: analysisResult, error } = await supabase.functions.invoke('execute-analysis-step', {
            body: {
              workflowItemId: workflowItem.id,
              step: index + 1,
              snippetId: item.snippet_id,
              analysisType: item.analysis_type
            },
          });

          console.log('Analysis result:', analysisResult);

          if (error) throw error;

          // Update item with results
          await supabase
            .from('workflow_items')
            .update({
              status: 'completed',
              result_data: analysisResult
            })
            .eq('id', workflowItem.id);

          queryClient.invalidateQueries({ queryKey: ['workflow-items'] });
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          
          // Update item status to failed
          await supabase
            .from('workflow_items')
            .update({
              status: 'failed',
              result_data: { error: analysisError.message }
            })
            .eq('id', workflowItem.id);

          throw analysisError;
        }
      }

      // Update session status to completed
      await supabase
        .from('workflow_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      toast.success('Workflow completed successfully');
    } catch (error) {
      console.error('Workflow error:', error);
      toast.error('Error executing workflow: ' + (error as Error).message);
      
      await supabase
        .from('workflow_sessions')
        .update({ status: 'failed' })
        .eq('id', sessionId);
    }
  };

  const addItem = (
    title: string, 
    description: string | undefined, 
    workflowType: string = 'generic',
    snippetId: string,
    analysisType?: string
  ) => {
    setSelectedItems(prev => [...prev, { 
      title, 
      description, 
      workflow_type: workflowType,
      snippet_id: snippetId,
      analysis_type: analysisType
    }]);
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
