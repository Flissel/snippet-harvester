
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface CodeInputProps {
  form: UseFormReturn<any>;
  selectedCode?: string;
}

export function CodeInput({ form, selectedCode }: CodeInputProps) {
  return (
    <FormField
      control={form.control}
      name="default_value"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Selected Code</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Selected code will appear here" 
              {...field} 
              value={selectedCode || field.value}
              className="font-mono"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
