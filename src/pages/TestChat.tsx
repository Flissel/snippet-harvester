
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Save, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
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

  const handleConfigurationDeleted = useCallback(() => {
    // Reset the selected prompt if it was deleted
    setSelectedPrompt(undefined);
    setSystemMessage('');
    setUserMessage('');
    resetChat();
    toast({
      title: "Configuration Deleted",
      description: "The configuration has been deleted successfully",
    });
  }, [setSelectedPrompt, setSystemMessage, setUserMessage]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold">Test Chat with Agent</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowLoadDialog(true)}
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Load</span>
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowSaveDialog(true)} 
            disabled={!selectedPrompt || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>
      
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-[70vh]">
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
        onConfigurationDeleted={handleConfigurationDeleted}
      />
    </div>
  );
}
