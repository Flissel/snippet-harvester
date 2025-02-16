
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Prompt } from '@/types/prompts';
import { usePromptConfiguration } from './test-chat/hooks/usePromptConfiguration';
import { PromptConfiguration } from './test-chat/components/PromptConfiguration';
import { SaveConfigurationDialog } from './test-chat/components/SaveConfigurationDialog';

export default function TestChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatKey, setChatKey] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const {
    prompts,
    selectedPrompt,
    isLoading,
    systemMessage,
    setSystemMessage,
    userMessage,
    setUserMessage,
    hasUnsavedChanges,
    setSelectedPrompt,
    saveConfiguration
  } = usePromptConfiguration(user);

  const resetChat = () => {
    setChatKey(prev => prev + 1);
    toast({
      title: "Chat Reset",
      description: "Started a new conversation with current prompt settings",
    });
  };

  const handlePromptSelect = (promptId: string) => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to switch prompts?")) {
        const prompt = prompts.find(p => p.id === promptId);
        setSelectedPrompt(prompt);
        resetChat();
      }
    } else {
      const prompt = prompts.find(p => p.id === promptId);
      setSelectedPrompt(prompt);
      resetChat();
    }
  };

  const handleSaveConfiguration = async () => {
    const success = await saveConfiguration();
    if (success) {
      setShowSaveDialog(false);
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={resetChat}
            disabled={!selectedPrompt}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Chat
          </Button>
          <Button 
            onClick={() => setShowSaveDialog(true)} 
            disabled={!selectedPrompt || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
      
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PromptConfiguration
            prompts={prompts}
            selectedPrompt={selectedPrompt}
            systemMessage={systemMessage}
            userMessage={userMessage}
            hasUnsavedChanges={hasUnsavedChanges}
            onPromptSelect={handlePromptSelect}
            onSystemMessageChange={setSystemMessage}
            onUserMessageChange={setUserMessage}
          />

          <ChatWindow 
            key={chatKey}
            prompt={{
              ...selectedPrompt,
              system_message: systemMessage,
              user_message: userMessage,
            } as Prompt} 
          />
        </div>
      )}

      <SaveConfigurationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveConfiguration}
      />
    </div>
  );
}
