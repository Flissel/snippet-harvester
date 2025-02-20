
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
  event_message?: string;
  execution_time_ms?: number;
}

export function useWorkflowExecution() {
  const { createSession, addWorkflowItem } = useWorkflowMutations();
  const queryClient = useQueryClient();

  const executeSingleItem = async (item: SelectedWorkflowItem, onLog?: (log: ExecutionLog) => void) => {
    const startTime = Date.now();
    try {
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: 'Creating test session...',
        status: 'in_progress',
        event_message: `Starting workflow for item: ${item.title}`
      });

      const session = await createSession.mutateAsync({
        name: 'Test Session',
        snippetId: item.snippet_id
      });

      const sessionTime = Date.now() - startTime;
      console.log('Created test session:', session.id);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Created test session: ${session.id}`,
        status: 'completed',
        execution_time_ms: sessionTime,
        event_message: `Session created successfully with ID: ${session.id}`
      });

      const workflowStartTime = Date.now();
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

      const workflowTime = Date.now() - workflowStartTime;
      console.log('Created test workflow item:', workflowItem.id);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Created workflow item: ${workflowItem.id}`,
        status: 'completed',
        execution_time_ms: workflowTime,
        event_message: `Workflow item created with ID: ${workflowItem.id}`
      });

      await supabase
        .from('workflow_items')
        .update({ status: 'in_progress' })
        .eq('id', workflowItem.id);

      const analysisStartTime = Date.now();
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'execute-analysis-step',
        message: 'Starting analysis...',
        status: 'in_progress',
        event_message: `Analyzing snippet: ${item.snippet_id}`
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

        const analysisTime = Date.now() - analysisStartTime;
        console.log('Analysis result:', analysisResult);
        onLog?.({
          timestamp: new Date().toISOString(),
          functionId: 'execute-analysis-step',
          message: 'Analysis completed successfully',
          status: 'completed',
          execution_time_ms: analysisTime,
          event_message: `Analysis completed for workflow item: ${workflowItem.id}`
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
          status: 'failed',
          event_message: `Error during analysis: ${analysisError.message}`
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
        status: 'failed',
        event_message: `Workflow execution error: ${error.message}`
      });
      toast.error('Error executing test: ' + (error as Error).message);
      throw error;
    }
  };

  const executeWorkflow = async (sessionId: string, items: SelectedWorkflowItem[], onLog?: (log: ExecutionLog) => void) => {
    const startTime = Date.now();
    try {
      await supabase
        .from('workflow_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);

      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: 'Starting workflow execution...',
        status: 'in_progress',
        event_message: `Beginning workflow execution for ${items.length} items`
      });

      for (const [index, item] of items.entries()) {
        const itemStartTime = Date.now();
        console.log('Processing workflow item:', index + 1);
        onLog?.({
          timestamp: new Date().toISOString(),
          functionId: 'workflow',
          message: `Processing item ${index + 1}: ${item.title}`,
          status: 'in_progress',
          event_message: `Starting item ${index + 1} of ${items.length}`
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

        const itemProcessTime = Date.now() - itemStartTime;
        console.log('Created workflow item:', workflowItem.id);

        await supabase
          .from('workflow_items')
          .update({ status: 'in_progress' })
          .eq('id', workflowItem.id);

        try {
          const analysisStartTime = Date.now();
          onLog?.({
            timestamp: new Date().toISOString(),
            functionId: 'execute-analysis-step',
            message: `Starting analysis for step ${index + 1}...`,
            status: 'in_progress',
            event_message: `Analyzing item: ${item.title}`
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

          const analysisTime = Date.now() - analysisStartTime;
          console.log('Analysis result:', analysisResult);
          onLog?.({
            timestamp: new Date().toISOString(),
            functionId: 'execute-analysis-step',
            message: `Analysis completed for step ${index + 1}`,
            status: 'completed',
            execution_time_ms: analysisTime,
            event_message: `Analysis completed for item: ${item.title}`
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
            status: 'failed',
            event_message: `Error analyzing item ${index + 1}: ${analysisError.message}`
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

      const totalTime = Date.now() - startTime;
      await supabase
        .from('workflow_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: 'Workflow completed successfully',
        status: 'completed',
        execution_time_ms: totalTime,
        event_message: `Completed workflow execution for ${items.length} items`
      });

      toast.success('Workflow completed successfully');
    } catch (error) {
      console.error('Workflow error:', error);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'workflow',
        message: `Workflow failed: ${error.message}`,
        status: 'failed',
        event_message: `Workflow execution failed: ${error.message}`
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
