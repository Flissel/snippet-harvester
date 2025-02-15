
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SnippetForm } from "./SnippetForm";
import { UseFormReturn } from "react-hook-form";
import { SnippetFormValues } from "./hooks/useSnippetForm";

interface SnippetEditModeProps {
  onClose: () => void;
  form: UseFormReturn<SnippetFormValues>;
  onSubmit: (values: SnippetFormValues) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function SnippetEditMode({
  onClose,
  form,
  onSubmit,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: SnippetEditModeProps) {
  return (
    <>
      <CardHeader className="relative border-b">
        <div className="absolute right-2 top-2">
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-destructive/20 hover:text-destructive transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle>Edit Snippet</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <SnippetForm
          form={form}
          onSubmit={onSubmit}
          onCancel={onClose}
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
        />
      </CardContent>
    </>
  );
}
