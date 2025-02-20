
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Prompt } from '@/types/prompts';

interface UseMessageHandlerProps {
  sendMessage: (message: string) => Promise<void>;
  prompt?: Prompt;
  isGenerating: boolean;
}

export function useMessageHandler({ sendMessage, prompt, isGenerating }: UseMessageHandlerProps) {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const useTemplate = () => {
    if (prompt?.user_message) {
      setInput(prompt.user_message);
      toast({
        title: "Template Applied",
        description: "User message template has been copied to input",
      });
    }
  };

  return {
    input,
    setInput,
    handleSend,
    useTemplate,
  };
}
