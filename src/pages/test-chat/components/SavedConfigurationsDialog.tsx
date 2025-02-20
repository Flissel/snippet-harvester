
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prompt, PromptModel } from '@/types/prompts';
import { useToast } from '@/components/ui/use-toast';
import { ConfigurationsList } from './saved-configurations/ConfigurationsList';
import { DeleteConfigurationDialog } from './saved-configurations/DeleteConfigurationDialog';

interface SavedConfigurationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigurationSelect: (config: Prompt) => void;
  onConfigurationEdit?: (config: Prompt) => void;
  onConfigurationDeleted?: () => void;
}

export function SavedConfigurationsDialog({
  open,
  onOpenChange,
  onConfigurationSelect,
  onConfigurationEdit,
  onConfigurationDeleted,
}: SavedConfigurationsDialogProps) {
  const [configToDelete, setConfigToDelete] = useState<Prompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations, isLoading, error } = useQuery({
    queryKey: ['saved-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the model field to PromptModel type
      return (data || []).map(config => ({
        ...config,
        model: config.model as PromptModel
      })) as Prompt[];
    },
  });

  const handleDelete = async () => {
    if (!configToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('prompt_configurations')
        .delete()
        .eq('id', configToDelete.id);

      if (error) throw error;

      setAlertOpen(false);
      await new Promise(resolve => setTimeout(resolve, 200));
      await queryClient.invalidateQueries({ queryKey: ['saved-configurations'] });
      onConfigurationDeleted?.();

      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfigToDelete(null);
    }
  };

  const handleDeleteClick = (config: Prompt) => {
    setConfigToDelete(config);
    setAlertOpen(true);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load configurations",
      variant: "destructive",
    });
  }

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={(newOpen) => {
          if (!isDeleting) {
            onOpenChange(newOpen);
            if (!newOpen) {
              setConfigToDelete(null);
              setAlertOpen(false);
            }
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Saved Configurations</DialogTitle>
          </DialogHeader>
          
          <ConfigurationsList
            configurations={configurations || []}
            isLoading={isLoading}
            onEdit={onConfigurationEdit || (() => {})}
            onDelete={handleDeleteClick}
            onSelect={onConfigurationSelect}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfigurationDialog
        config={configToDelete}
        isOpen={alertOpen}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setAlertOpen(open);
            if (!open) setConfigToDelete(null);
          }
        }}
        onDelete={handleDelete}
      />
    </>
  );
}
