
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowSession, WorkflowItem } from '@/types/workflow';
import { toast } from 'sonner';

export function useWorkflowMutations() {
  const queryClient = useQueryClient();

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

  const addWorkflowItem = useMutation({
    mutationFn: async ({ 
      sessionId, 
      title,
      description,
      workflowType,
      orderIndex,
      snippetId,
      analysisType,
      systemMessage,
      userMessage,
      model 
    }: {
      sessionId: string;
      title: string;
      description?: string;
      workflowType: string;
      orderIndex: number;
      snippetId: string;
      analysisType?: string;
      systemMessage?: string;
      userMessage?: string;
      model?: string;
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
          analysis_type: analysisType,
          system_message: systemMessage,
          user_message: userMessage,
          model: model || 'gpt-4o-mini'
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowItem;
    },
  });

  return {
    createSession,
    addWorkflowItem,
  };
}
