
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
    console.log("Starting snippet creation...");
    console.log("Current user:", user);
    
    if (!user?.id) {
      console.log("No user ID found!");
      toast({
        title: "Error",
        description: "You must be logged in to create snippets.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating snippet with data:", {
        ...values,
        created_by: user.id
      });
      
      const snippetData = {
        title: values.title,
        description: values.description || null,
        code_content: values.code_content,
        language: values.language,
        is_public: values.is_public,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("snippets")
        .insert(snippetData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      console.log("Snippet created successfully:", data);

      // Optimistically update the cache
      queryClient.setQueryData<any[]>(["snippets"], (old = []) => [data, ...old]);

      // Then invalidate to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: ["snippets"] });

      toast({
        title: "Success",
        description: "Snippet created successfully",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Full error object:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create snippet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { form, createSnippet };
};
