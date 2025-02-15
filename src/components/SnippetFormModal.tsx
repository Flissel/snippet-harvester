import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Minus, Plus, RotateCcw } from "lucide-react";

const snippetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code_content: z.string().min(1, "Code content is required"),
  language: z.string().min(1, "Language is required"),
  is_public: z.boolean().default(true),
});

type SnippetFormValues = z.infer<typeof snippetFormSchema>;

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
];

export function SnippetFormModal() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetFormSchema),
    defaultValues: {
      title: "",
      description: "",
      code_content: "",
      language: "javascript",
      is_public: true,
    },
  });

  const handleFormSubmit = (values: SnippetFormValues) => {
    setFormData(values);
    setConfirmOpen(true);
  };

  const onSubmit = async () => {
    if (!user?.id || !formData) return;

    try {
      const snippetData = {
        title: formData.title,
        description: formData.description || null,
        code_content: formData.code_content,
        language: formData.language,
        is_public: formData.is_public,
        created_by: user.id,
      };

      const { error } = await supabase.from("snippets").insert(snippetData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Snippet created successfully",
      });

      setOpen(false);
      setConfirmOpen(false);
      setFormData(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
    } catch (error) {
      console.error("Error creating snippet:", error);
      toast({
        title: "Error",
        description: "Failed to create snippet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="ml-4">New Snippet</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Snippet</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 h-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter snippet title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter snippet description (optional)"
                            className="h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Code Content</FormLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{zoom}%</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleResetZoom}
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
                      <FormItem>
                        <FormControl>
                          <ScrollArea className="h-[400px] border rounded-md">
                            <div className="p-4">
                              <Textarea
                                placeholder="Enter your code here"
                                className="font-mono min-h-[380px] border-0 focus-visible:ring-0 resize-none"
                                style={{
                                  transform: `scale(${zoom / 100})`,
                                  transformOrigin: 'top left',
                                }}
                                {...field}
                              />
                            </div>
                          </ScrollArea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Review Snippet</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Snippet Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Please review your snippet before creating it:
            </AlertDialogDescription>
          </AlertDialogHeader>
          {formData && (
            <ScrollArea className="flex-1 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Title</h4>
                  <p>{formData.title}</p>
                </div>
                {formData.description && (
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-muted-foreground">{formData.description}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-1">Language</h4>
                  <p className="text-muted-foreground">
                    {LANGUAGE_OPTIONS.find(l => l.value === formData.language)?.label}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Code Content</h4>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                      {formData.code_content}
                    </pre>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <AlertDialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Edit Snippet
            </Button>
            <Button onClick={onSubmit}>
              Create Snippet
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
