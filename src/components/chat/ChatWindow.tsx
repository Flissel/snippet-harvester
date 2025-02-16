
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Loader, Send, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Prompt } from '@/types/prompts';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  context?: string;
}

interface ChatWindowProps {
  prompt?: Prompt;
}

export function ChatWindow({ prompt }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      createNewSession();
    }
  }, [user, prompt]);

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

  const sendMessage = async () => {
    if (!input.trim() || !session) return;

    try {
      // Insert user message
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

      // Call chat completion function
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: messagesData,
          sessionId: session.id,
          model: prompt?.model || 'gpt-4o-mini',
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  if (!user) {
    return (
      <Card className="p-4 text-center">
        <p>Please log in to start a chat session.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : message.role === 'system'
                    ? 'bg-muted/50 mr-4'
                    : 'bg-muted mr-4'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex flex-col gap-2">
          {prompt?.user_message && (
            <Button
              variant="outline"
              className="self-end"
              onClick={useTemplate}
              size="sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[60px]"
              disabled={isLoading || !session}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || !session}
              className="self-end"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
