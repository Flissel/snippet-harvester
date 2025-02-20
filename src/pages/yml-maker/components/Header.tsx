
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, Play } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Prompt } from '@/types/prompts';

interface HeaderProps {
  selectedPrompt: Prompt | null;
  prompts: Prompt[] | undefined;
  isProcessing: boolean;
  itemCount: number;
  sectionsExist: boolean;
  onNavigateBack: () => void;
  onPromptSelect: (promptId: string) => void;
  onAddToWorkflow: () => void;
  onStartWorkflow: () => void;
  onSave: () => void;
}

export function Header({
  selectedPrompt,
  prompts,
  isProcessing,
  itemCount,
  sectionsExist,
  onNavigateBack,
  onPromptSelect,
  onAddToWorkflow,
  onStartWorkflow,
  onSave,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2"
        onClick={onNavigateBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Snippets
      </Button>
      <div className="flex items-center gap-2">
        <Select
          value={selectedPrompt?.id}
          onValueChange={onPromptSelect}
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
          onClick={onAddToWorkflow}
          disabled={isProcessing || !selectedPrompt}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add to Workflow
        </Button>
        <Button
          variant="default"
          onClick={onStartWorkflow}
          disabled={isProcessing || itemCount === 0}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Start Workflow
        </Button>
        <Button 
          onClick={onSave}
          disabled={!sectionsExist}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
