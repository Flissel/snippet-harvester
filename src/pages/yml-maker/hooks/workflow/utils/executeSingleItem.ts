
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectedWorkflowItem } from '@/types/workflow';
import { ExecutionLog } from '../useWorkflowExecution';
import { QueryClient } from '@tanstack/react-query';

const DEFAULT_USER_MESSAGE = `Analyze this code and provide:
1. A list of required imports
2. A YML configuration that captures all configurable parameters
3. The processed Python code with the configuration applied

Format your response with sections separated by "---":

Required Imports:
<list imports here>
---
YML Configuration:
<yml configuration here>
---
Processed Code:
<processed code here>

Code to analyze:
{code}`;

export async function executeSingleItem(
  item: SelectedWorkflowItem,
  createSession: any,
  addWorkflowItem: any,
  queryClient: QueryClient,
  onLog?: (log: ExecutionLog) => void
) {
  const startTime = Date.now();
  try {
    // First, fetch the code content
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('code_content')
      .eq('id', item.snippet_id)
      .single();

    if (snippetError) throw snippetError;

    // Use provided user message or default, and replace {code} placeholder
    const userMessage = (item.user_message || DEFAULT_USER_MESSAGE).replace('{code}', snippet.code_content);

    onLog?.({
      timestamp: new Date().toISOString(),
      functionId: 'workflow',
      message: 'Creating test session...',
      status: 'in_progress',
      event_message: `Starting workflow for item: ${item.title}`,
      request_data: {
        name: 'Test Session',
        snippetId: item.snippet_id
      }
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
      event_message: `Session created successfully with ID: ${session.id}`,
      response_data: session
    });

    const workflowStartTime = Date.now();
    const workflowItemData = {
      sessionId: session.id,
      title: item.title,
      description: item.description,
      workflowType: item.workflow_type,
      orderIndex: 0,
      snippetId: item.snippet_id,
      analysisType: item.analysis_type,
      systemMessage: item.system_message,
      userMessage: userMessage, // Use our processed user message
      model: item.model
    };

    onLog?.({
      timestamp: new Date().toISOString(),
      functionId: 'workflow',
      message: 'Creating workflow item...',
      status: 'in_progress',
      event_message: `Creating workflow item for session: ${session.id}`,
      request_data: workflowItemData
    });

    const workflowItem = await addWorkflowItem.mutateAsync(workflowItemData);

    const workflowTime = Date.now() - workflowStartTime;
    console.log('Created test workflow item:', workflowItem.id);
    onLog?.({
      timestamp: new Date().toISOString(),
      functionId: 'workflow',
      message: `Created workflow item: ${workflowItem.id}`,
      status: 'completed',
      execution_time_ms: workflowTime,
      event_message: `Workflow item created with ID: ${workflowItem.id}`,
      response_data: workflowItem
    });

    await supabase
      .from('workflow_items')
      .update({ status: 'in_progress' })
      .eq('id', workflowItem.id);

    const analysisStartTime = Date.now();
    const analysisRequestData = {
      workflowItemId: workflowItem.id,
      step: 1,
      snippetId: item.snippet_id,
      analysisType: item.analysis_type,
      systemMessage: item.system_message,
      userMessage: userMessage, // Use our processed user message
      model: item.model
    };

    onLog?.({
      timestamp: new Date().toISOString(),
      functionId: 'execute-analysis-step',
      message: 'Starting analysis...',
      status: 'in_progress',
      event_message: `Analyzing snippet: ${item.snippet_id}`,
      request_data: analysisRequestData
    });

    try {
      const { data: analysisResult, error } = await supabase.functions.invoke('execute-analysis-step', {
        body: analysisRequestData,
      });

      const analysisTime = Date.now() - analysisStartTime;
      console.log('Analysis result:', analysisResult);
      onLog?.({
        timestamp: new Date().toISOString(),
        functionId: 'execute-analysis-step',
        message: 'Analysis completed successfully',
        status: 'completed',
        execution_time_ms: analysisTime,
        event_message: `Analysis completed for workflow item: ${workflowItem.id}`,
        response_data: analysisResult
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
        event_message: `Error during analysis: ${analysisError.message}`,
        response_data: analysisError
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
      event_message: `Workflow execution error: ${error.message}`,
      response_data: error
    });
    toast.error('Error executing test: ' + (error as Error).message);
    throw error;
  }
}
