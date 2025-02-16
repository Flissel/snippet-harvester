
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage, ChatSession } from '../types';
import { Prompt } from '@/types/prompts';

export function useChatSession(user: any, prompt?: Prompt) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const { toast } = useToast();

  const createNewSession = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to start a chat session.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          title: `Chat ${new Date().toLocaleString()}`,
          created_by: user.id
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Add initial system message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionData.id,
          role: 'system',
          content: prompt?.system_message || 'I am an AI assistant specialized in helping with AutoGen implementation. How can I help you today?'
        });

      if (messageError) throw messageError;
      
      // Load messages
      loadMessages(sessionData.id);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please refresh the page.',
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    session,
    createNewSession,
    loadMessages,
  };
}
