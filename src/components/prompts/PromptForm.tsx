
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompts';
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePromptForm } from './hooks/usePromptForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PromptFormProps {
  prompt?: Prompt;
  onCancel: () => void;
}

export function PromptForm({ prompt, onCancel }: PromptFormProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { form, generateSystemMessage, onSubmit } = usePromptForm(prompt, onCancel);

  const handleNext = async () => {
    const currentStep = step;
    
    if (currentStep === 1) {
      const titleValid = await form.trigger(['name', 'description']);
      if (!titleValid) return;
      
      setIsGenerating(true);
      await generateSystemMessage(form.getValues('name'), form.getValues('description'));
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
      onSubmit(form.getValues());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitForm} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        onClick={() => generateSystemMessage(
                          form.getValues('name'),
                          form.getValues('description')
                        )}
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
