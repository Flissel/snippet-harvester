
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LabelTemplate } from '@/types/prompts';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LabelTemplateForm } from './LabelTemplateForm';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface LabelTemplatesListProps {
  labelTemplates: LabelTemplate[];
}

export function LabelTemplatesList({ labelTemplates }: LabelTemplatesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteLabelTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('label_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['label_templates'] });
      toast.success('Label template deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete label template: ' + error.message);
    },
  });

  if (labelTemplates.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No label templates found. Create one to get started.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {labelTemplates.map((template) => (
          <Card key={template.id} className="p-4">
            {editingId === template.id ? (
              <LabelTemplateForm
                template={template}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(template.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLabelTemplate.mutate(template.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {template.config_type}
                  </div>
                  {template.template_placeholder && (
                    <div>
                      <span className="font-medium">Placeholder:</span>{' '}
                      {template.template_placeholder}
                    </div>
                  )}
                  {template.default_value && (
                    <div>
                      <span className="font-medium">Default Value:</span>{' '}
                      {template.default_value}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
