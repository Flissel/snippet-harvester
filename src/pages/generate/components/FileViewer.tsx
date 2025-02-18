
import { FileCode2, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode, DirectoryNode, collectFilesFromDirectory } from '../types';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Prompt } from '@/types/prompts';

interface FileViewerProps {
  selectedFile: FileNode | null;
  selectedDirectory: DirectoryNode | null;
  fileContent: string | null;
  isCreatingSnippets: boolean;
  onCreateSnippet: () => void;
  onCreateDirectorySnippets: () => void;
}

export function FileViewer({
  selectedFile,
  selectedDirectory,
  fileContent,
  isCreatingSnippets,
  onCreateSnippet,
  onCreateDirectorySnippets,
}: FileViewerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Failed to Load Prompts",
        description: "Could not load prompts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (extension?: string) => {
    return <FileCode2 className="h-4 w-4 text-blue-500" />;
  };

  const getFileTypeBadge = (extension?: string) => {
    if (!extension) return null;
    
    return (
      <Badge className="ml-2 bg-blue-500">.{extension}</Badge>
    );
  };

  const detectConfigurations = async () => {
    if (!fileContent || !selectedFile?.extension) return;
    if (!selectedPrompt) {
      toast({
        title: "No Prompt Selected",
        description: "Please select a prompt before detecting configurations.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('detect-yml-config', {
        body: {
          code: fileContent,
          systemMessage: selectedPrompt.system_message,
          userMessage: selectedPrompt.user_message,
          model: selectedPrompt.model,
        },
      });

      if (error) throw error;

      // Handle the response data according to your YML configuration needs
      console.log('Configuration detected:', data);
    } catch (error) {
      console.error('Error detecting configurations:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to detect configurations. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          {selectedFile ? (
            <>
              <span className="flex items-center">
                {getFileIcon(selectedFile.extension)}
                <span className="ml-2">File: {selectedFile.name}</span>
                {getFileTypeBadge(selectedFile.extension)}
              </span>
            </>
          ) : selectedDirectory ? (
            <>Directory: {selectedDirectory.name}</>
          ) : (
            'Select a file or directory'
          )}
        </h2>
        <div className="flex gap-2">
          {selectedFile && fileContent && (
            <>
              <Button onClick={onCreateSnippet}>
                Create Snippet
              </Button>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedPrompt?.id}
                  onValueChange={(value) => {
                    const prompt = prompts.find(p => p.id === value);
                    setSelectedPrompt(prompt || null);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={detectConfigurations} 
                  disabled={isProcessing || !selectedPrompt}
                  variant="outline"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Detect Configurations
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
          {selectedDirectory && (
            <Button 
              onClick={onCreateDirectorySnippets}
              disabled={isCreatingSnippets}
            >
              {isCreatingSnippets ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Snippets...
                </>
              ) : (
                'Create Directory Snippets'
              )}
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 border rounded-md">
        {fileContent ? (
          <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{fileContent}</pre>
        ) : selectedDirectory ? (
          <div className="p-4 space-y-4">
            <h3 className="font-medium">Files in Directory:</h3>
            <div className="space-y-2">
              {collectFilesFromDirectory(selectedDirectory, []).map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-md"
                >
                  {getFileIcon(file.extension)}
                  <span className="text-sm">{file.path}</span>
                  {getFileTypeBadge(file.extension)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4">
            Select a file or directory to view
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
