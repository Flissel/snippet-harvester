
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '@/types/prompts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedConfigurationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigurationSelect: (config: Prompt) => void;
  onConfigurationEdit?: (config: Prompt) => void;
}

export function SavedConfigurationsDialog({
  open,
  onOpenChange,
  onConfigurationSelect,
  onConfigurationEdit,
}: SavedConfigurationsDialogProps) {
  const [configToDelete, setConfigToDelete] = useState<Prompt | null>(null);
  const { toast } = useToast();

  const { data: configurations, isLoading, refetch } = useQuery({
    queryKey: ['saved-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!configToDelete) return;

    try {
      const { error } = await supabase
        .from('prompt_configurations')
        .delete()
        .eq('id', configToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });

      // Refresh the configurations list
      refetch();
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      });
    } finally {
      setConfigToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Saved Configurations</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : configurations?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No saved configurations found
              </p>
            ) : (
              <div className="space-y-4">
                {configurations?.map((config) => (
                  <Card key={config.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{config.name}</h3>
                        {config.description && (
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(new Date(config.created_at))} ago
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (onConfigurationEdit) {
                              onConfigurationEdit(config as Prompt);
                              onOpenChange(false);
                            }
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfigToDelete(config as Prompt)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => {
                            onConfigurationSelect(config as Prompt);
                            onOpenChange(false);
                          }}
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!configToDelete} onOpenChange={() => setConfigToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Configuration
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{configToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
