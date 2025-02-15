
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SnippetForm } from "./snippets/SnippetForm";
import { SnippetPreview } from "./snippets/SnippetPreview";
import { useSnippetForm, SnippetFormValues } from "./snippets/hooks/useSnippetForm";

export function SnippetFormModal() {
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [formData, setFormData] = React.useState<SnippetFormValues | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSuccess = () => {
    setOpen(false);
    setConfirmOpen(false);
    setFormData(null);
  };

  const { form, createSnippet } = useSnippetForm(handleSuccess);

  const handleFormSubmit = (values: SnippetFormValues) => {
    setFormData(values);
    setConfirmOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>New Snippet</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Create New Snippet</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <SnippetForm
              form={form}
              onSubmit={handleFormSubmit}
              onCancel={() => setOpen(false)}
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Snippet Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Please review your snippet before creating it:
            </AlertDialogDescription>
          </AlertDialogHeader>
          {formData && <SnippetPreview snippet={formData} />}
          <AlertDialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Edit Snippet
            </Button>
            <Button onClick={() => createSnippet(formData!)}>
              Create Snippet
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
