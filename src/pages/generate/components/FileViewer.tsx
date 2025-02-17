
import { FileCode2, Loader2, Brain, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode, DirectoryNode, collectFilesFromDirectory } from '../types';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileViewerProps {
  selectedFile: FileNode | null;
  selectedDirectory: DirectoryNode | null;
  fileContent: string | null;
  isCreatingSnippets: boolean;
  onCreateSnippet: () => void;
  onCreateDirectorySnippets: () => void;
}

interface AnalysisConfig {
  analyzers: {
    overview: boolean;
    components: boolean;
    issues: boolean;
    dependencies: boolean;
    documentation: boolean;
    complexity: boolean;
    security: boolean;
    performance: boolean;
  };
  depth: 'basic' | 'standard' | 'detailed';
  style: 'simple' | 'technical' | 'comprehensive';
}

export function FileViewer({
  selectedFile,
  selectedDirectory,
  fileContent,
  isCreatingSnippets,
  onCreateSnippet,
  onCreateDirectorySnippets,
}: FileViewerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    analyzers: {
      overview: true,
      components: true,
      issues: true,
      dependencies: true,
      documentation: true,
      complexity: false,
      security: false,
      performance: false,
    },
    depth: 'standard',
    style: 'technical',
  });

  const getFileIcon = (extension?: string) => {
    return <FileCode2 className="h-4 w-4 text-blue-500" />;
  };

  const getFileTypeBadge = (extension?: string) => {
    if (!extension) return null;
    
    return (
      <Badge className="ml-2 bg-blue-500">.{extension}</Badge>
    );
  };

  const analyzeCode = async () => {
    if (!fileContent || !selectedFile?.extension) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: {
          code: fileContent,
          language: selectedFile.extension,
          config: analysisConfig,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAnalyzer = (key: keyof typeof analysisConfig.analyzers) => {
    setAnalysisConfig(prev => ({
      ...prev,
      analyzers: {
        ...prev.analyzers,
        [key]: !prev.analyzers[key],
      },
    }));
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Analysis Configuration</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure the code analysis parameters
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Sections to Include</Label>
                          {Object.entries(analysisConfig.analyzers).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <Switch
                                checked={value}
                                onCheckedChange={() => toggleAnalyzer(key as keyof typeof analysisConfig.analyzers)}
                              />
                              <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <Label>Analysis Depth</Label>
                          <Select
                            value={analysisConfig.depth}
                            onValueChange={(value: typeof analysisConfig.depth) => 
                              setAnalysisConfig(prev => ({ ...prev, depth: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Analysis Style</Label>
                          <Select
                            value={analysisConfig.style}
                            onValueChange={(value: typeof analysisConfig.style) => 
                              setAnalysisConfig(prev => ({ ...prev, style: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="comprehensive">Comprehensive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button 
                onClick={analyzeCode} 
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Code
                  </>
                )}
              </Button>
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
          <div className="space-y-4">
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{fileContent}</pre>
            {analysis && (
              <div className="border-t p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-blue-500" />
                  Code Analysis
                </h3>
                <div className="prose prose-sm max-w-none">
                  {analysis.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
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
