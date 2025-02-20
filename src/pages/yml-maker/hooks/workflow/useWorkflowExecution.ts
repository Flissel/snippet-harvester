
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectedWorkflowItem } from '@/types/workflow';
import { useWorkflowMutations } from './useWorkflowMutations';
import { useQueryClient } from '@tanstack/react-query';

export function useWorkflowExecution() {
  const { createSession, addWorkflowItem } = useWorkflowMutations();
  const queryClient = useQueryClient();

  const executeSingleItem = async (item: SelectedWorkflowItem) => {
    try {
      const session = await createSession.mutateAsync({
        name: 'Test Session',
        snippetId: item.snippet_id
      });

      console.log('Created test session:', session.id);

      const workflowItem = await addWorkflowItem.mutateAsync({
        sessionId: session.id,
        title: item.title,
        description: item.description,
        workflowType: item.workflow_type,
        orderIndex: 0,
        snippetId: item.snippet_id,
        analysisType: item.analysis_type
      });

      console.log('Created test workflow item:', workflowItem.id);

      await supabase
        .from('workflow_items')
        .update({ status: 'in_progress' })
        .eq('id', workflowItem.id);

      try {
        const { data: analysisResult, error } = await supabase.functions.invoke('execute-analysis-step', {
          body: {
            workflowItemId: workflowItem.id,
            step: 1,
            snippetId: item.snippet_id,
            analysisType: item.analysis_type
          },
        });

        console.log('Analysis result:', analysisResult);

        if (error) throw error;

        await supabase
          .from('workflow_items')
          .update({
            status: 'completed',
            result_data: analysisResult
          })
          .eq('id', workflowItem.id);

        await supabase
          .from('workflow_sessions')
          .update({ status: 'completed' })
          .eq('id', session.id);

        queryClient.invalidateQueries({ queryKey: ['workflow-items'] });
        toast.success('Test execution completed successfully');
        
        return analysisResult;
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        
        await supabase
          .from('workflow_items')
          .update({
            status: 'failed',
            result_data: { error: analysisError.message }
          })
          .eq('id', workflowItem.id);

        await supabase
          .from('workflow_sessions')
          .update({ status: 'failed' })
          .eq('id', session.id);

        throw analysisError;
      }
    } catch (error) {
      console.error('Test execution error:', error);
      toast.error('Error executing test: ' + (error as Error).message);
      throw error;
    }
  };

  const executeWorkflow = async (sessionId: string, items: SelectedWorkflowItem[]) => {
    try {
      await supabase
        .from('workflow_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);

      for (const [index, item] of items.entries()) {
        console.log('Processing workflow item:', index + 1);

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

        await supabase
          .from('workflow_items')
          .update({ status: 'in_progress' })
          .eq('id', workflowItem.id);

        try {
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

  return {
    executeSingleItem,
    executeWorkflow,
  };
}
