
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Prompt, PromptDescription } from '@/types/prompts';
import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { usePromptForm } from './hooks/usePromptForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GenerationSettingsFields } from './FormFields/GenerationSettingsFields';
import { DescriptionFields } from './FormFields/DescriptionFields';
import { SystemMessageStep } from './FormFields/SystemMessageStep';
import { UserMessageStep } from './FormFields/UserMessageStep';

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

            <DescriptionFields form={form} />
            <GenerationSettingsFields />
          </div>
        )}

        {step === 2 && (
          <SystemMessageStep 
            form={form} 
            onRegenerate={generateSystemMessage} 
            emptyDescription={EMPTY_DESCRIPTION}
          />
        )}

        {step === 3 && (
          <UserMessageStep form={form} />
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
