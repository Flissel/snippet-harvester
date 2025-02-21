
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { PromptFormValues } from '../hooks/usePromptForm';
import { PromptDescription } from '@/types/prompts';

interface SystemMessageStepProps {
  form: UseFormReturn<PromptFormValues>;
  onRegenerate: (name: string, description: PromptDescription, settings: {
    role?: string;
    guidelines?: string;
    structure?: string;
  }) => void;
  emptyDescription: PromptDescription;
}

export function SystemMessageStep({ form, onRegenerate, emptyDescription }: SystemMessageStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="system_message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>System Message</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Textarea
                  placeholder="Generated system message..."
                  className="min-h-[200px]"
                  {...field}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const description = form.getValues('description_structured');
                    const completeDescription: PromptDescription = {
                      ...emptyDescription,
                      ...description
                    };
                    onRegenerate(
                      form.getValues('name'),
                      completeDescription,
                      {
                        role: form.getValues('prompt_generation_role'),
                        guidelines: form.getValues('prompt_generation_guidelines'),
                        structure: form.getValues('prompt_generation_structure'),
                      }
                    );
                  }}
                >
                  Regenerate
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
