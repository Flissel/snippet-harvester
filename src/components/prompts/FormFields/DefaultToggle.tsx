
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { PromptFormValues } from '../hooks/usePromptForm';

interface DefaultToggleProps {
  form: UseFormReturn<PromptFormValues>;
}

export function DefaultToggle({ form }: DefaultToggleProps) {
  return (
    <FormField
      control={form.control}
      name="is_default"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Set as Default
            </FormLabel>
            <div className="text-sm text-muted-foreground">
              Make this prompt the default for analysis
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
