
import React from "react";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { SnippetFormValues } from "./hooks/useSnippetForm";

interface CodeEditorFieldProps {
  form: UseFormReturn<SnippetFormValues>;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function CodeEditorField({ form, zoom, onZoomIn, onZoomOut, onResetZoom }: CodeEditorFieldProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <FormLabel>Code Content</FormLabel>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{zoom}%</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onZoomOut}
            disabled={zoom <= 50}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onZoomIn}
            disabled={zoom >= 200}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onResetZoom}
            disabled={zoom === 100}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <FormField
        control={form.control}
        name="code_content"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <ScrollArea className="h-[calc(100vh-380px)] border rounded-md">
                <div className="p-4">
                  <Textarea
                    placeholder="Enter your code here"
                    className="font-mono min-h-[300px] border-0 focus-visible:ring-0 resize-none"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                    }}
                    {...field}
                  />
                </div>
              </ScrollArea>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
