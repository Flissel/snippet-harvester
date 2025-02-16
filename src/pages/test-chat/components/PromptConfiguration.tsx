
import { Prompt } from '@/types/prompts';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PromptConfigurationProps {
  prompts: Prompt[];
  selectedPrompt?: Prompt;
  systemMessage: string;
  userMessage: string;
  hasUnsavedChanges: boolean;
  onPromptSelect: (promptId: string) => void;
  onSystemMessageChange: (message: string) => void;
  onUserMessageChange: (message: string) => void;
}

export function PromptConfiguration({
  prompts,
  selectedPrompt,
  systemMessage,
  userMessage,
  hasUnsavedChanges,
  onPromptSelect,
  onSystemMessageChange,
  onUserMessageChange,
}: PromptConfigurationProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Prompt Configuration</h2>
        <Select
          value={selectedPrompt?.id}
          onValueChange={onPromptSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a prompt" />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                {prompt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasUnsavedChanges && (
        <Alert>
          <AlertDescription>
            You have unsaved changes to this prompt configuration. Test them in the chat, and save when you're satisfied.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h3 className="font-medium">System Message</h3>
        <Textarea 
          value={systemMessage}
          onChange={(e) => onSystemMessageChange(e.target.value)}
          className="min-h-[200px]"
          placeholder="System message..."
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">User Message Template</h3>
        <Textarea 
          value={userMessage}
          onChange={(e) => onUserMessageChange(e.target.value)}
          className="min-h-[100px]"
          placeholder="User message template..."
        />
      </div>
    </Card>
  );
}
