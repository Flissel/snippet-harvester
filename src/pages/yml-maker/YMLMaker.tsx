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
import { AnalysisResponseCard } from './components/AnalysisResponseCard';

export function YMLMaker() {
  const { snippetId } = useParams<{ snippetId: string }>();
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<any | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

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

  const { workflow, handleAddToWorkflow, handleStartWorkflow } = useYMLMaker({
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

  const handleSaveConfig = async () => {
    if (!snippet || workflow.sections.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ymlSection = workflow.sections.find(s => s.title.toLowerCase().includes('yml configuration'));
      const importsSection = workflow.sections.find(s => s.title.toLowerCase().includes('required imports'));
      const codeSection = workflow.sections.find(s => s.title.toLowerCase().includes('processed code'));

      const { error } = await supabase
        .from('yml_configurations')
        .insert({
          snippet_id: snippet.id,
          config_type: 'model',
          yml_content: ymlSection?.content || '',
          imports: importsSection ? importsSection.content.split('\n').filter(Boolean) : [],
          processed_code: codeSection?.content || '',
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleTestItem = async (item: SelectedWorkflowItem) => {
    try {
      setIsLoadingResponse(true);
      const result = await executeSingleItem(item);
      setAnalysisResponse(result);
    } catch (error) {
      console.error('Test execution error:', error);
      setAnalysisResponse({ error: (error as Error).message });
    } finally {
      setIsLoadingResponse(false);
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
        onAddToWorkflow={handleAddToWorkflow}
        onStartWorkflow={handleStartWorkflow}
        onSave={handleSaveConfig}
      />

      <div className="grid grid-cols-2 gap-6">
        <div>
          {snippet && (
            <CodeEditor
              snippet={snippet}
              selectedCode={workflow.selectedCode}
              onCodeChange={workflow.handleCodeChange}
            />
          )}
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
            results={workflow.results}
          />

          <YMLPreview sections={workflow.sections} />
        </div>
      </div>
    </div>
  );
}
