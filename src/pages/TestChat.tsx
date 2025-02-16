
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/prompts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

export default function TestChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [systemMessage, setSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      setSystemMessage(selectedPrompt.system_message);
      setUserMessage(selectedPrompt.user_message);
    }
  }, [selectedPrompt]);

  const loadPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
      
      // Set default prompt if available
      const defaultPrompt = data?.find(p => p.is_default);
      if (defaultPrompt) {
        setSelectedPrompt(defaultPrompt);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!user || !selectedPrompt) return;

    try {
      const { data, error } = await supabase
        .from('prompt_configurations')
        .insert({
          name: `${selectedPrompt.name} - Configuration`,
          system_message: systemMessage,
          user_message: userMessage,
          model: selectedPrompt.model,
          created_by: user.id,
          yaml_template: selectedPrompt.yaml_template,
          description: `Configuration based on prompt: ${selectedPrompt.name}`,
          is_finalized: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Test Chat with Agent</h1>
        </div>
        <Button onClick={saveConfiguration} disabled={!selectedPrompt}>
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>
      
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Prompt Configuration</h2>
              <Select
                value={selectedPrompt?.id}
                onValueChange={(value) => {
                  const prompt = prompts.find(p => p.id === value);
                  setSelectedPrompt(prompt);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a prompt" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">System Message</h3>
              <Textarea 
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                className="min-h-[200px]"
                placeholder="System message..."
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">User Message Template</h3>
              <Textarea 
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="min-h-[100px]"
                placeholder="User message template..."
              />
            </div>
          </Card>

          <ChatWindow 
            prompt={{
              ...selectedPrompt,
              system_message: systemMessage,
              user_message: userMessage,
            } as Prompt} 
          />
        </div>
      )}
    </div>
  );
}
