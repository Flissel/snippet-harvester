
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Prompt, PromptDescription } from '@/types/prompts';
import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePromptForm } from './hooks/usePromptForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GenerationSettingsFields } from './FormFields/GenerationSettingsFields';

interface PromptFormProps {
  prompt?: Prompt;
  onCancel: () => void;
}

// Default values for required fields
const EMPTY_DESCRIPTION: PromptDescription = {
  purpose: '',
  input: '',
  output: '',
  example: '',
  considerations: ''
};

export function PromptForm({ prompt, onCancel }: PromptFormProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { form, generateSystemMessage, onSubmit } = usePromptForm(prompt, onCancel);

  const handleNext = async () => {
    const currentStep = step;
    
    if (currentStep === 1) {
      const fieldsValid = await form.trigger([
        'name', 
        'description_structured.purpose',
        'description_structured.input',
        'description_structured.output',
        'description_structured.example'
      ]);
      if (!fieldsValid) return;
      
      setIsGenerating(true);
      const description = form.getValues('description_structured');
      // Ensure all required fields are present
      const completeDescription: PromptDescription = {
        ...EMPTY_DESCRIPTION,
        ...description
      };
      
      await generateSystemMessage(
        form.getValues('name'), 
        completeDescription,
        {
          role: form.getValues('prompt_generation_role'),
          guidelines: form.getValues('prompt_generation_guidelines'),
          structure: form.getValues('prompt_generation_structure'),
        }
      );
      setIsGenerating(false);
    }
    
    setStep(currentStep + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = await form.trigger();
    if (valid) {
      const values = form.getValues();
      // Ensure description has all required fields
      const completeDescription: PromptDescription = {
        ...EMPTY_DESCRIPTION,
        ...values.description_structured
      };
      values.description_structured = completeDescription;
      onSubmit(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <GenerationSettingsFields />
          </div>
        )}

        {step === 2 && (
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
                            ...EMPTY_DESCRIPTION,
                            ...description
                          };
                          generateSystemMessage(
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
        )}

        {step === 3 && (
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
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isGenerating}
            >
              {isGenerating ? <LoadingSpinner /> : 'Next'}
            </Button>
          ) : (
            <Button type="submit">
              Create Prompt
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
