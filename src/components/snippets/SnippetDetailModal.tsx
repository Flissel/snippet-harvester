
import { Card } from "@/components/ui/card";
import { Snippet } from "@/types/snippets";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { snippetFormSchema, SnippetFormValues } from "./hooks/useSnippetForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateSnippet } from "./hooks/useUpdateSnippet";
import { SnippetViewMode } from "./SnippetViewMode";
import { SnippetEditMode } from "./SnippetEditMode";

interface SnippetDetailModalProps {
  snippet: Snippet;
  onClose: () => void;
}

export function SnippetDetailModal({ snippet, onClose }: SnippetDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const { user } = useAuth();

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetFormSchema),
    defaultValues: {
      title: snippet.title ?? "",
      description: snippet.description ?? "",
      code_content: snippet.code_content ?? "",
      language: snippet.language ?? "text",
      is_public: snippet.is_public ?? true,
    },
  });

  const { updateSnippet } = useUpdateSnippet(snippet.id, () => {
    setIsEditing(false);
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code_content);
      setIsCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  const canModify = user?.id === snippet.created_by;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full ${isEditing ? 'max-w-4xl' : 'max-w-3xl'} max-h-[90vh] flex flex-col animate-fade-in ${!isEditing ? 'shadow-lg bg-gradient-to-b from-card to-card/50' : ''}`}>
        {isEditing ? (
          <SnippetEditMode
            onClose={() => setIsEditing(false)}
            form={form}
            onSubmit={updateSnippet}
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
          />
        ) : (
          <SnippetViewMode
            snippet={snippet}
            onClose={onClose}
            onEdit={() => setIsEditing(true)}
            onCopy={copyToClipboard}
            isCopied={isCopied}
            canModify={canModify}
          />
        )}
      </Card>
    </div>
  );
}
