
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Brain } from 'lucide-react';
import { FileViewer } from '@/pages/generate/components/FileViewer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { YMLPreview } from './components/YMLPreview';
import { useYMLMaker } from './hooks/useYMLMaker';
import { useAnalysisProcess } from './hooks/useAnalysisProcess';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Prompt } from '@/types/prompts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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

  const handleCodeChange = (content: string) => {
    setSelectedCode(content);
  };

  const isProcessing = isProcessingYML || isProcessingAnalysis;

  if (isLoadingSnippet || isLoadingPrompts) {
    return <div>Loading...</div>;
  }

  if (!snippet) {
    return <div>Snippet not found</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => navigate('/snippets')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Snippets
        </Button>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPrompt?.id}
            onValueChange={(value) => {
              const prompt = prompts?.find(p => p.id === value);
              setSelectedPrompt(prompt || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select analysis prompt" />
            </SelectTrigger>
            <SelectContent>
              {prompts?.map((prompt) => (
                <SelectItem key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            onClick={() => {
              if (!selectedPrompt) {
                toast.error("Please select a prompt first");
                return;
              }
              if (!selectedCode) {
                setSelectedCode(snippet.code_content);
              }
              processNextStep(selectedCode || snippet.code_content);
            }}
            disabled={isProcessing || !selectedPrompt}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Process Step {currentStep}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={sections.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border">
            <FileViewer
              selectedFile={{
                type: 'file',
                name: snippet.title,
                path: snippet.title,
                url: '',
                extension: snippet.language || 'py',
              }}
              fileContent={selectedCode || snippet.code_content}
              selectedDirectory={null}
              isCreatingSnippets={false}
              onCreateSnippet={() => {}}
              onCreateDirectorySnippets={() => {}}
              onContentChange={handleCodeChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Analysis Progress</h3>
              <Badge variant="outline">Step {currentStep} of 4</Badge>
            </div>
            {results?.map((result, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-medium mb-2">Step {result.step_number} Result</h4>
                <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result.result_data, null, 2)}
                </pre>
              </div>
            ))}
          </Card>
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
