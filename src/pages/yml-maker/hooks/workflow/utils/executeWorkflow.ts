
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectedWorkflowItem } from '@/types/workflow';
import { ExecutionLog } from '../useWorkflowExecution';
import { QueryClient } from '@tanstack/react-query';

export async function executeWorkflow(
  sessionId: string,
  items: SelectedWorkflowItem[],
  addWorkflowItem: any,
  queryClient: QueryClient,
  onLog?: (log: ExecutionLog) => void
) {
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
}
