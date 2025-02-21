
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PromptFormValues } from '../hooks/usePromptForm';

interface DescriptionFieldsProps {
  form: UseFormReturn<PromptFormValues>;
}

export function DescriptionFields({ form }: DescriptionFieldsProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
      <h3 className="font-medium">Description</h3>
      
      <FormField
        control={form.control}
        name="description_structured.purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What is the purpose of this prompt?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Explain what this prompt is designed to do.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description_structured.input"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Input</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What input does this prompt expect?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Describe the expected input format and requirements.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description_structured.output"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Output</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What output will this prompt generate?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Describe the expected output format and structure.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description_structured.example"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Example</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Provide an example of input and output"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Show a practical example of how the prompt works.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description_structured.considerations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Considerations (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any additional considerations or notes?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Add any important notes or considerations for using this prompt.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
