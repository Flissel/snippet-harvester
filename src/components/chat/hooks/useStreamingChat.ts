import { useState, useEffect, useRef } from 'react';
import { Prompt, PromptModel } from '@/types/prompts';
import { Message } from '../types';

export function useStreamingChat(prompt?: Prompt) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionPrompt, setSessionPrompt] = useState<Prompt | undefined>(prompt);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentStreamingMessageRef = useRef<string>('');

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
    currentStreamingMessageRef.current = '';

    // Add empty assistant message that will be updated during streaming
    const assistantMessageId = Date.now().toString();
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
    };
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    try {
      const projectId = 'nacxysqeciqbtdznnhud';
      const url = `https://${projectId}.supabase.co/functions/v1/agent-message`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hY3h5c3FlY2lxYnRkem5uaHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MTM4MTgsImV4cCI6MjA1NTE4OTgxOH0.z_YdTs367MAqm1ryTlCSfZ6bFRpDLu2nb947E2UwpCM`,
        },
        body: JSON.stringify({
          message: messageContent,
          prompt: {
            id: sessionPrompt.id,
            name: sessionPrompt.name,
            system_message: sessionPrompt.system_message,
            user_message: sessionPrompt.user_message,
            model: sessionPrompt.model,
          },
          chatHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              setIsGenerating(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                currentStreamingMessageRef.current += parsed.content;
                
                // Update the last message (assistant message) with streaming content
                setMessages((prevMessages) => {
                  const newMessages = [...prevMessages];
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1] = {
                      ...newMessages[newMessages.length - 1],
                      content: currentStreamingMessageRef.current,
                    };
                  }
                  return newMessages;
                });
              }
            } catch (parseError) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Replace the empty assistant message with error message
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your message.',
          };
        }
        return newMessages;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    currentStreamingMessageRef.current = '';
  };

  return {
    messages,
    isGenerating,
    sendMessage,
    resetChat,
    sessionPrompt,
  };
}