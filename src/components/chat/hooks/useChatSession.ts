import { useState, useEffect } from 'react';
import { Prompt, PromptModel } from '@/types/prompts';
import { Message } from '../types';
import { supabase } from '@/integrations/supabase/client';

export function useChatSession(prompt?: Prompt) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionPrompt, setSessionPrompt] = useState<Prompt | undefined>(prompt);

  useEffect(() => {
    if (prompt) {
      setSessionPrompt({ ...prompt, model: prompt.model as PromptModel });
    }
  }, [prompt]);

  const sendMessage = async (messageContent: string) => {
    if (!sessionPrompt) {
      console.error('No prompt selected for the chat session.');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsGenerating(true);

    try {
      const { data } = await supabase.functions.invoke('agent-message', {
        body: {
          message: messageContent,
          prompt: {
            id: sessionPrompt.id,
            name: sessionPrompt.name,
            system_message: sessionPrompt.system_message,
            user_message: sessionPrompt.user_message,
            model: sessionPrompt.model,
          },
          chatHistory: messages,
        },
      });

      if (data && data.response) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        console.error('Error processing message:', data);
        const errorAiMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your message.',
        };
        setMessages((prevMessages) => [...prevMessages, errorAiMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorAiMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message.',
      };
      setMessages((prevMessages) => [...prevMessages, errorAiMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isGenerating,
    sendMessage,
    resetChat,
    sessionPrompt,
  };
}
