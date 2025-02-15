
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const snippetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code_content: z.string().min(1, "Code content is required"),
  language: z.string().min(1, "Language is required"),
  is_public: z.boolean().default(true),
});

export type SnippetFormValues = z.infer<typeof snippetFormSchema>;

export const useSnippetForm = (onSuccess: () => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const createSnippet = async (values: SnippetFormValues) => {
    if (!user?.id) return;

    try {
      const snippetData = {
        title: values.title,
        description: values.description || null,
        code_content: values.code_content,
        language: values.language,
        is_public: values.is_public,
        created_by: user.id,
      };

      const { error } = await supabase.from("snippets").insert(snippetData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Snippet created successfully",
      });

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      onSuccess();
    } catch (error) {
      console.error("Error creating snippet:", error);
      toast({
        title: "Error",
        description: "Failed to create snippet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { form, createSnippet };
};
