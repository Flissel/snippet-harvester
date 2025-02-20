
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectedWorkflowItem } from '@/types/workflow';
import { useWorkflowMutations } from './useWorkflowMutations';
import { useQueryClient } from '@tanstack/react-query';

export interface ExecutionLog {
  timestamp: string;
  functionId: string;
  message: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export function useWorkflowExecution() {
  const { createSession, addWorkflowItem } = useWorkflowMutations();
  const queryClient = useQueryClient();

  const executeSingleItem = async (item: SelectedWorkflowItem, onLog?: (log: ExecutionLog) => void) => {
    try {
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: 'Creating test session...',
        status: 'in_progress'
      });

      const session = await createSession.mutateAsync({
        name: 'Test Session',
        snippetId: item.snippet_id
      });

      console.log('Created test session:', session.id);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Created test session: ${session.id}`,
        status: 'completed'
      });

      const workflowItem = await addWorkflowItem.mutateAsync({
        sessionId: session.id,
        title: item.title,
        description: item.description,
        workflowType: item.workflow_type,
        orderIndex: 0,
        snippetId: item.snippet_id,
        analysisType: item.analysis_type,
        systemMessage: item.system_message,
        userMessage: item.user_message,
        model: item.model
      });

      console.log('Created test workflow item:', workflowItem.id);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Created workflow item: ${workflowItem.id}`,
        status: 'completed'
      });

      await supabase
        .from('workflow_items')
        .update({ status: 'in_progress' })
        .eq('id', workflowItem.id);

      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'execute-analysis-step',
        message: 'Starting analysis...',
        status: 'in_progress'
      });

      try {
        const { data: analysisResult, error } = await supabase.functions.invoke('execute-analysis-step', {
          body: {
            workflowItemId: workflowItem.id,
            step: 1,
            snippetId: item.snippet_id,
            analysisType: item.analysis_type,
            systemMessage: item.system_message,
            userMessage: item.user_message,
            model: item.model
          },
        });

        console.log('Analysis result:', analysisResult);
        onLog?.({
          timestamp: new Date().toISOString(),
          functionId: 'execute-analysis-step',
          message: 'Analysis completed successfully',
          status: 'completed'
        });

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
        onLog?.({
          timestamp: new Date().toISOString(),
          functionId: 'execute-analysis-step',
          message: `Analysis failed: ${analysisError.message}`,
          status: 'failed'
        });
        
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
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Test execution failed: ${error.message}`,
        status: 'failed'
      });
      toast.error('Error executing test: ' + (error as Error).message);
      throw error;
    }
  };

  const executeWorkflow = async (sessionId: string, items: SelectedWorkflowItem[], onLog?: (log: ExecutionLog) => void) => {
    try {
      await supabase
        .from('workflow_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);

      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: 'Starting workflow execution...',
        status: 'in_progress'
      });

      for (const [index, item] of items.entries()) {
        console.log('Processing workflow item:', index + 1);
        onLog?.({
          timestamp: new Date().toISOString(),
          functionId: 'workflow',
          message: `Processing item ${index + 1}: ${item.title}`,
          status: 'in_progress'
        });

        const workflowItem = await addWorkflowItem.mutateAsync({
          sessionId,
          title: item.title,
          description: item.description,
          workflowType: item.workflow_type,
          orderIndex: index,
          snippetId: item.snippet_id,
          analysisType: item.analysis_type,
          systemMessage: item.system_message,
          userMessage: item.user_message,
          model: item.model
        });

        console.log('Created workflow item:', workflowItem.id);

        await supabase
          .from('workflow_items')
          .update({ status: 'in_progress' })
          .eq('id', workflowItem.id);

        try {
          onLog?.({
            timestamp: new Date().toISOString(),
            functionId: 'execute-analysis-step',
            message: `Starting analysis for step ${index + 1}...`,
            status: 'in_progress'
          });

          const { data: analysisResult, error } = await supabase.functions.invoke('execute-analysis-step', {
            body: {
              workflowItemId: workflowItem.id,
              step: index + 1,
              snippetId: item.snippet_id,
              analysisType: item.analysis_type,
              systemMessage: item.system_message,
              userMessage: item.user_message,
              model: item.model
            },
          });

          console.log('Analysis result:', analysisResult);
          onLog?.({
            timestamp: new Date().toISOString(),
            functionId: 'execute-analysis-step',
            message: `Analysis completed for step ${index + 1}`,
            status: 'completed'
          });

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
          onLog?.({
            timestamp: new Date().toISOString(),
            functionId: 'execute-analysis-step',
            message: `Analysis failed for step ${index + 1}: ${analysisError.message}`,
            status: 'failed'
          });
          
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

      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: 'Workflow completed successfully',
        status: 'completed'
      });

      toast.success('Workflow completed successfully');
    } catch (error) {
      console.error('Workflow error:', error);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Workflow failed: ${error.message}`,
        status: 'failed'
      });
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
