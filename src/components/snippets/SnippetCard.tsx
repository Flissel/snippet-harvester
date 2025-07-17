
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, FileCode, Maximize2, Wand2, Trash2, Sparkles, Clock, Code } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Snippet } from "@/types/snippets";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface SnippetCardProps {
  snippet: Snippet;
  onExpand: (snippet: Snippet) => void;
  onCopy: (code: string, id: string) => void;
  onAnalyze: (snippet: Snippet) => void;
  isExpanded: boolean;
  isCopied: boolean;
  isFocused: boolean;
}

export function SnippetCard({
  snippet,
  onExpand,
  onCopy,
  onAnalyze,
  isExpanded,
  isCopied,
  isFocused
}: SnippetCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippet.id);

      if (error) throw error;

      toast.success("Snippet deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    } catch (error: any) {
      toast.error("Failed to delete snippet: " + error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const canModify = user?.id === snippet.created_by;
  const createdAt = new Date(snippet.created_at).toLocaleDateString();

  return (
    <>
      <div 
        className={`group relative cursor-pointer transition-all duration-500 transform hover:scale-105 animate-fade-in ${
          isFocused ? 'scale-105' : ''
        }`}
        onClick={() => onExpand(snippet)}
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <Card className={`relative card-enhanced border-border/50 hover:border-primary/30 transition-all duration-300 ${
          isFocused ? 'ring-2 ring-primary/50 border-primary/50' : ''
        }`}>
          <CardHeader className="relative pb-3">
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-card/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(snippet.code_content, snippet.id);
                }}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-success animate-scale-in" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              {canModify && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-card/80 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Language badge */}
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant="outline" 
                className="text-xs bg-primary/5 border-primary/20 text-primary"
              >
                <Code className="h-3 w-3 mr-1" />
                {snippet.language || 'text'}
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {createdAt}
              </div>
            </div>

            <CardTitle className="text-xl font-semibold leading-tight pr-16">
              {snippet.title}
            </CardTitle>
            
            {snippet.description && (
              <CardDescription className="text-muted-foreground line-clamp-2">
                {snippet.description}
              </CardDescription>
            )}

            {/* Action buttons */}
            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="default"
                size="sm"
                className="w-full btn-gradient flex items-center justify-center gap-2 group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalyze(snippet);
                }}
              >
                <Sparkles className="h-4 w-4 group-hover/btn:animate-pulse" />
                Analyze with AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full btn-glass flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/yml-maker/${snippet.id}`);
                }}
              >
                <FileCode className="h-4 w-4" />
                Generate YML
              </Button>
            </div>
          </CardHeader>

          {/* Expanded content */}
          {isExpanded && (
            <CardContent className="border-t border-border/50 pt-4 animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-muted/20 rounded-lg blur-sm"></div>
                <div className="relative bg-card/80 backdrop-blur-sm rounded-lg overflow-hidden border border-border/30">
                  <ScrollArea className="h-[250px] p-4">
                    <SyntaxHighlighter
                      language={snippet.language || 'text'}
                      style={atomOneDark}
                      customStyle={{
                        background: 'transparent',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.875rem',
                      }}
                      wrapLongLines
                    >
                      {snippet.code_content}
                    </SyntaxHighlighter>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="card-enhanced border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Snippet
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium text-foreground">"{snippet.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="btn-glass">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Snippet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
