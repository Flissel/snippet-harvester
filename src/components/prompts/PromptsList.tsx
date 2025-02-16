
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompts';
import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PromptForm } from './PromptForm';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface PromptsListProps {
  prompts: Prompt[];
}

export function PromptsList({ prompts }: PromptsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deletePrompt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success('Prompt deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete prompt: ' + error.message);
    },
  });

  if (prompts.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No prompts found. Create one to get started.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="p-4">
            {editingId === prompt.id ? (
              <PromptForm
                prompt={prompt}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {prompt.name}
                      {prompt.is_default && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          Default
                        </span>
                      )}
                    </h3>
                    {prompt.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {prompt.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(prompt.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePrompt.mutate(prompt.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">System Message</h4>
                    <pre className="text-sm bg-muted p-2 rounded-lg whitespace-pre-wrap">
                      {prompt.system_message}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">User Message</h4>
                    <pre className="text-sm bg-muted p-2 rounded-lg whitespace-pre-wrap">
                      {prompt.user_message}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
