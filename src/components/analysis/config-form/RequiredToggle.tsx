
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';

interface RequiredToggleProps {
  form: UseFormReturn<any>;
}

export function RequiredToggle({ form }: RequiredToggleProps) {
  return (
    <FormField
      control={form.control}
      name="is_required"
      render={({ field }) => (
        <FormItem className="flex items-center gap-2">
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
