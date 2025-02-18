
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, FileCode, Brain } from 'lucide-react';
import { FileViewer } from '@/pages/generate/components/FileViewer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { YMLPreview } from './components/YMLPreview';
import { ProcessedCode } from './components/ProcessedCode';
import { useYMLMaker } from './hooks/useYMLMaker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Prompt } from '@/types/prompts';

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
    ymlContent,
    imports,
    processedCode,
    isProcessing,
    detectConfigurations,
    handleSave,
  } = useYMLMaker(snippet);

  const handleCodeChange = (content: string) => {
    setSelectedCode(content);
  };

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
              detectConfigurations(selectedCode || snippet.code_content);
            }}
            disabled={isProcessing || !selectedPrompt}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Analyze Code
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!ymlContent}
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
          {(ymlContent || processedCode) && (
            <>
              {imports && imports.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">Required Imports</h3>
                  <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                    {imports.join('\n')}
                  </pre>
                </div>
              )}
              {ymlContent && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">YML Configuration</h3>
                  <YMLPreview 
                    ymlContent={ymlContent} 
                    imports={imports}
                  />
                </div>
              )}
              {processedCode && (
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-2">Processed Python Code</h3>
                  <ProcessedCode 
                    code={processedCode}
                  />
                </div>
              )}
            </>
          )}
          {isProcessing && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
