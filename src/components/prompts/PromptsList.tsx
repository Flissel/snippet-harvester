
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompts';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{prompt.name}</h3>
                    {prompt.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {prompt.description}
                      </p>
                    )}
                    <p className="text-sm mt-2 bg-muted p-2 rounded-lg">
                      {truncateText(prompt.system_message)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
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
              </div>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
