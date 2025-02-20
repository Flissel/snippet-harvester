
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WorkflowSession, WorkflowItem } from '@/types/workflow';
import { Snippet } from '@/types/snippets';
import { Prompt } from '@/types/prompts';

export function useWorkflow() {
  const [selectedItems, setSelectedItems] = useState<Array<{
    snippet: Snippet;
    prompt: Prompt;
  }>>([]);
  const queryClient = useQueryClient();

  // Create workflow session
  const createSession = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflow_sessions')
        .insert({
          created_by: user.id,
          status: 'pending',
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
      snippetId, 
      promptId, 
      orderIndex 
    }: {
      sessionId: string;
      snippetId: string;
      promptId: string;
      orderIndex: number;
    }) => {
      const { data, error } = await supabase
        .from('workflow_items')
        .insert({
          workflow_session_id: sessionId,
          snippet_id: snippetId,
          prompt_id: promptId,
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
      for (const item of selectedItems) {
        const { data: workflowItem } = await supabase
          .from('workflow_items')
          .select()
          .eq('workflow_session_id', sessionId)
          .eq('snippet_id', item.snippet.id)
          .single();

        if (!workflowItem) continue;

        // Update item status
        await supabase
          .from('workflow_items')
          .update({ status: 'in_progress' })
          .eq('id', workflowItem.id);

        // Execute analysis
        const result = await supabase.functions.invoke('execute-analysis-step', {
          body: {
            code: item.snippet.code_content,
            prompt: item.prompt,
            step: 1,
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

  const addItem = (snippet: Snippet, prompt: Prompt) => {
    setSelectedItems(prev => [...prev, { snippet, prompt }]);
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
