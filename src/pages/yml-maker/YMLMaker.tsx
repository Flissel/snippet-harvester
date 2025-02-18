
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, FileCode, Wand2 } from 'lucide-react';
import { FileViewer } from '@/pages/generate/components/FileViewer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { YMLPreview } from './components/YMLPreview';
import { ProcessedCode } from './components/ProcessedCode';
import { useYMLMaker } from './hooks/useYMLMaker';

export function YMLMaker() {
  const navigate = useNavigate();
  const { snippetId } = useParams<{ snippetId: string }>();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  
  const { data: snippet, isLoading } = useQuery({
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

  const {
    ymlContent,
    imports,
    processedCode,
    isProcessing,
    detectConfigurations,
    handleSave,
  } = useYMLMaker(snippet);

  if (isLoading) {
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
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedCode(snippet.code_content);
              detectConfigurations(snippet.code_content);
            }}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Detect Configurations
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
              fileContent={snippet.code_content}
              selectedDirectory={null}
              isCreatingSnippets={false}
              onCreateSnippet={() => {}}
              onCreateDirectorySnippets={() => {}}
            />
          </div>
        </div>

        <div className="space-y-4">
          {(ymlContent || processedCode) && (
            <>
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
                  <h3 className="text-lg font-semibold mb-2">Processed Code</h3>
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
