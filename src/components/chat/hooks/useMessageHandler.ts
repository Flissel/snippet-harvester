
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ChatSession } from '../types';
import { Prompt } from '@/types/prompts';

export function useMessageHandler(
  session: ChatSession | null,
  loadMessages: (sessionId: string) => Promise<void>,
  prompt?: Prompt
) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || !session) return;

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          role: 'user',
          content: input.trim(),
        })
        .select()
        .single();

      if (messageError) throw messageError;

      setInput('');
      setIsLoading(true);

      // Get all messages for context
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      // Call chat completion function with current system message
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: messagesData,
          sessionId: session.id,
          model: prompt?.model || 'gpt-4o-mini',
          currentSystemMessage: prompt?.system_message
        },
      });

      if (error) throw error;

      // Reload messages to get the new assistant response
      await loadMessages(session.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
    isLoading,
    sendMessage,
    useTemplate,
  };
}
