
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { YMLPreview } from './components/YMLPreview';
import { useYMLMaker } from './hooks/useYMLMaker';
import { useAnalysisProcess } from './hooks/useAnalysisProcess';
import { useWorkflow } from './hooks/useWorkflow';
import { Prompt } from '@/types/prompts';
import { SelectedWorkflowItem } from '@/types/workflow';
import { Header } from './components/Header';
import { WorkflowQueue } from './components/WorkflowQueue';
import { AnalysisResults } from './components/AnalysisResults';
import { CodeEditor } from './components/CodeEditor';

export function YMLMaker() {
  const navigate = useNavigate();
  const { snippetId } = useParams<{ snippetId: string }>();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  const { data: snippet, isLoading: isLoadingSnippet } = useQuery({
    queryKey: ['snippet', snippetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', snippetId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: prompts, isLoading: isLoadingPrompts } = useQuery({
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

  const {
    sections,
    isProcessing: isProcessingYML,
    detectConfigurations,
    handleSave,
  } = useYMLMaker(snippet);

  const {
    currentStep,
    results,
    processNextStep,
    isProcessing: isProcessingAnalysis,
  } = useAnalysisProcess(snippet);

  const {
    selectedItems,
    addItem,
    removeItem,
    createSession,
    addWorkflowItem,
    executeWorkflow,
    executeSingleItem,
  } = useWorkflow();

  const handleCodeChange = (content: string) => {
    setSelectedCode(content);
  };

  const handleAddToWorkflow = () => {
    if (!selectedPrompt || !snippet) {
      toast.error("Please select a prompt first");
      return;
    }
    
    addItem(
      snippet.title,
      snippet.description || undefined,
      'code_analysis',
      snippet.id,
      selectedPrompt.prompt_type
    );
    toast.success("Added to workflow");
  };

  const handleTestItem = async (item: SelectedWorkflowItem) => {
    try {
      await executeSingleItem(item);
    } catch (error) {
      console.error('Test execution failed:', error);
    }
  };

  const handleStartWorkflow = async () => {
    if (!snippetId || selectedItems.length === 0) {
      toast.error("Please add items to the workflow first");
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        name: "Code Analysis Workflow",
        snippetId: snippetId
      });
      await executeWorkflow(session.id);
    } catch (error) {
      toast.error("Failed to start workflow: " + (error as Error).message);
    }
  };

  const isProcessing = isProcessingYML || isProcessingAnalysis || 
                      createSession.isPending || addWorkflowItem.isPending;

  if (isLoadingSnippet || isLoadingPrompts) {
    return <div>Loading...</div>;
  }

  if (!snippet) {
    return <div>Snippet not found</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Header
        selectedPrompt={selectedPrompt}
        prompts={prompts}
        isProcessing={isProcessing}
        itemCount={selectedItems.length}
        sectionsExist={sections.length > 0}
        onNavigateBack={() => navigate('/snippets')}
        onPromptSelect={(value) => {
          const prompt = prompts?.find(p => p.id === value);
          setSelectedPrompt(prompt || null);
        }}
        onAddToWorkflow={handleAddToWorkflow}
        onStartWorkflow={handleStartWorkflow}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <CodeEditor
            snippet={snippet}
            selectedCode={selectedCode}
            onCodeChange={handleCodeChange}
          />
        </div>

        <div className="space-y-4">
          <WorkflowQueue
            items={selectedItems}
            onRemoveItem={removeItem}
            onTestItem={handleTestItem}
          />

          <AnalysisResults
            currentStep={currentStep}
            results={results}
          />

          {isProcessing ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <YMLPreview sections={sections} />
          )}
        </div>
      </div>
    </div>
  );
}
