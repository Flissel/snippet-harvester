
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PromptFormValues } from '../hooks/usePromptForm';

interface UserMessageStepProps {
  form: UseFormReturn<PromptFormValues>;
}

export function UserMessageStep({ form }: UserMessageStepProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="user_message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User Message Template</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter user message template"
                className="min-h-[200px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
