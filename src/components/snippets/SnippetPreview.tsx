
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LANGUAGE_OPTIONS } from "./constants";
import { SnippetFormValues } from "./hooks/useSnippetForm";

interface SnippetPreviewProps {
  snippet: SnippetFormValues;
}

export function SnippetPreview({ snippet }: SnippetPreviewProps) {
  return (
    <ScrollArea className="flex-1 mt-4">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">Title</h4>
          <p className="text-foreground">{snippet.title}</p>
        </div>
        {snippet.description && (
          <div>
            <h4 className="font-medium mb-1">Description</h4>
            <p className="text-muted-foreground">{snippet.description}</p>
          </div>
        )}
        <div>
          <h4 className="font-medium mb-1">Language</h4>
          <p className="text-muted-foreground">
            {LANGUAGE_OPTIONS.find(l => l.value === snippet.language)?.label}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Code Content</h4>
          <div className="bg-muted/50 p-4 rounded-md overflow-hidden">
            <ScrollArea className="h-[300px] w-full">
              <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                {snippet.code_content}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
