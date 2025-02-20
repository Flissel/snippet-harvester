
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Loader, Send, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatWindowProps } from './types';
import { useChatSession } from './hooks/useChatSession';
import { useMessageHandler } from './hooks/useMessageHandler';
import { MessageBubble } from './MessageBubble';

export function ChatWindow({ prompt, onResetChat }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, isGenerating, sendMessage, resetChat, sessionPrompt } = useChatSession(prompt);
  const { input, setInput, handleSend, useTemplate } = useMessageHandler({
    sendMessage,
    prompt,
    isGenerating
  });

  if (!user) {
    return (
      <Card className="p-4 text-center">
        <p>Please log in to start a chat session.</p>
      </Card>
    );
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 justify-end">
            {prompt?.user_message && (
              <Button
                variant="outline"
                onClick={useTemplate}
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                resetChat();
                onResetChat?.();
              }}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Chat
            </Button>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[60px]"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSend}
              disabled={isGenerating || !input.trim()}
              className="self-end"
            >
              {isGenerating ? (
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
