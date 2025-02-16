
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompts';
import { useEffect } from 'react';
import { BasicInfoFields } from './FormFields/BasicInfoFields';
import { MessageFields } from './FormFields/MessageFields';
import { DefaultToggle } from './FormFields/DefaultToggle';
import { usePromptForm } from './hooks/usePromptForm';

interface PromptFormProps {
  prompt?: Prompt;
  onCancel: () => void;
}

export function PromptForm({ prompt, onCancel }: PromptFormProps) {
  const { form, generateSystemMessage, onSubmit } = usePromptForm(prompt, onCancel);

  useEffect(() => {
    if (!prompt) {
      generateSystemMessage();
    }
  }, [prompt]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <MessageFields form={form} />
        <DefaultToggle form={form} />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {prompt ? 'Update' : 'Create'} Prompt
          </Button>
        </div>
      </form>
    </Form>
  );
}
