
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, FileCode, Wand2 } from 'lucide-react';
import { CodeViewer } from '@/pages/generate/components/FileViewer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { YMLPreview } from './components/YMLPreview';
import { ProcessedCode } from './components/ProcessedCode';
import { useYMLMaker } from './hooks/useYMLMaker';

export function YMLMaker() {
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
        <Button variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => detectConfigurations(selectedCode)}
            disabled={isProcessing || !selectedCode}
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

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border">
            <CodeViewer
              selectedFile={{ 
                name: snippet.title,
                extension: snippet.language || 'py',
                path: '',
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
          <YMLPreview 
            ymlContent={ymlContent} 
            imports={imports}
          />
          <ProcessedCode 
            code={processedCode}
          />
        </div>
      </div>
    </div>
  );
}
