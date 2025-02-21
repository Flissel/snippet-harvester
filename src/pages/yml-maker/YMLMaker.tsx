
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { YMLPreview } from './components/YMLPreview';
import { useYMLMaker } from './hooks/useYMLMaker';
import { useWorkflow } from './hooks/useWorkflow';
import { Prompt } from '@/types/prompts';
import { SelectedWorkflowItem } from '@/types/workflow';
import { Header } from './components/Header';
import { WorkflowQueue } from './components/WorkflowQueue';
import { AnalysisResults } from './components/analysis-results';
import { CodeEditor } from './components/CodeEditor';
import { AnalysisResponseCard } from './components/AnalysisResponseCard';
import { ExecutionLog } from './hooks/workflow/useWorkflowExecution';
import { ExecutionLogs } from './components/ExecutionLogs';

interface AnalysisResult {
  step_number: number;
  result_data: any;
  created_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  title?: string;
}

export function YMLMaker() {
  const { snippetId } = useParams<{ snippetId: string }>();
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<any | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [workflowResults, setWorkflowResults] = useState<AnalysisResult[]>([]);
  const [isSingleExecution, setIsSingleExecution] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  const { data: prompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
  });

  const { data: snippet } = useQuery({
    queryKey: ['snippets', snippetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', snippetId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!snippetId,
  });

  const { 
    workflow, 
    isProcessing,
    handleAddToWorkflow,
    handleStartWorkflow,
    handleSave: handleSaveConfig 
  } = useYMLMaker({
    snippet,
    selectedPrompt,
  });

  const { selectedItems, addItem, removeItem, executeSingleItem } = useWorkflow();

  const handlePromptSelect = (promptId: string) => {
    const prompt = prompts?.find((p) => p.id === promptId) ?? null;
    setSelectedPrompt(prompt);
  };

  const handleNavigateBack = () => {
    navigate('/snippets');
  };

  const handleLog = (log: ExecutionLog) => {
    setExecutionLogs(prev => [...prev, log]);
  };

  const handleTestItem = async (item: SelectedWorkflowItem) => {
    try {
      setIsLoadingResponse(true);
      setIsSingleExecution(true);
      setExecutionLogs([]); // Clear previous logs
      const result = await executeSingleItem(item, handleLog);
      setAnalysisResponse(result);
      setWorkflowResults([{
        step_number: 1,
        result_data: result,
        created_at: new Date().toISOString(),
        status: 'completed',
        title: item.title
      }]);
    } catch (error) {
      console.error('Test execution error:', error);
      setAnalysisResponse({ error: (error as Error).message });
      setWorkflowResults([{
        step_number: 1,
        result_data: { error: (error as Error).message },
        created_at: new Date().toISOString(),
        status: 'failed',
        title: item.title
      }]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleWorkflowAdd = async () => {
    if (!selectedPrompt || !snippet) {
      toast.error('Please select a prompt and ensure snippet is loaded');
      return;
    }

    try {
      await handleAddToWorkflow();
      
      addItem(
        selectedPrompt.name,
        selectedPrompt.description || undefined,
        'yml_analysis',
        snippet.id,
        selectedPrompt.prompt_type,
        selectedPrompt.system_message,
        selectedPrompt.user_message,
        selectedPrompt.model || 'gpt-4o-mini'
      );

      toast.success('Added to workflow queue');
    } catch (error) {
      console.error('Error adding to workflow:', error);
      toast.error('Failed to add to workflow');
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <Header
        selectedPrompt={selectedPrompt}
        prompts={prompts}
        isProcessing={isProcessing}
        itemCount={selectedItems.length}
        sectionsExist={workflow.sections.length > 0}
        onNavigateBack={handleNavigateBack}
        onPromptSelect={handlePromptSelect}
        onAddToWorkflow={handleWorkflowAdd}
        onStartWorkflow={handleStartWorkflow}
        onSave={handleSaveConfig}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {snippet && (
            <CodeEditor
              snippet={snippet}
              selectedCode={workflow.selectedCode}
              onCodeChange={workflow.handleCodeChange}
            />
          )}
          
          <ExecutionLogs logs={executionLogs} />
        </div>

        <div className="space-y-6">
          <WorkflowQueue
            items={selectedItems}
            onRemoveItem={removeItem}
            onTestItem={handleTestItem}
          />

          <AnalysisResponseCard
            response={analysisResponse}
            isLoading={isLoadingResponse}
          />

          <AnalysisResults
            currentStep={workflow.currentStep}
            results={isSingleExecution ? workflowResults : workflow.results}
            isSingleExecution={isSingleExecution}
          />

          <YMLPreview sections={workflow.sections} />
        </div>
      </div>
    </div>
  );
}
