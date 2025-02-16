
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Save, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Prompt } from '@/types/prompts';
import { usePromptConfiguration } from './test-chat/hooks/usePromptConfiguration';
import { PromptConfiguration } from './test-chat/components/PromptConfiguration';
import { SaveConfigurationDialog } from './test-chat/components/SaveConfigurationDialog';
import { SavedConfigurationsDialog } from './test-chat/components/SavedConfigurationsDialog';

export default function TestChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

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
    saveConfiguration,
    loadConfiguration
  } = usePromptConfiguration(user);

  const resetChat = () => {
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

  const handleLoadConfiguration = (config: Prompt) => {
    loadConfiguration(config);
    resetChat();
  };

  const handleEditConfiguration = (config: Prompt) => {
    loadConfiguration(config);
    resetChat();
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
            onClick={() => setShowLoadDialog(true)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Configuration
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
            prompt={{
              ...selectedPrompt,
              system_message: systemMessage,
              user_message: userMessage,
            } as Prompt}
            onResetChat={resetChat}
          />
        </div>
      )}

      <SaveConfigurationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveConfiguration}
      />

      <SavedConfigurationsDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onConfigurationSelect={handleLoadConfiguration}
        onConfigurationEdit={handleEditConfiguration}
      />
    </div>
  );
}
