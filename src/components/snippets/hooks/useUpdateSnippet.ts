
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SnippetFormValues } from "./useSnippetForm";

export const useUpdateSnippet = (snippetId: string, onSuccess: () => void) => {
  const queryClient = useQueryClient();

  const updateSnippet = async (values: SnippetFormValues) => {
    try {
      const { error } = await supabase
        .from("snippets")
        .update({
          title: values.title,
          description: values.description || null,
          code_content: values.code_content,
          language: values.language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", snippetId);

      if (error) throw error;

      toast.success("Snippet updated successfully");
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      onSuccess();
    } catch (error: any) {
      console.error("Error updating snippet:", error);
      toast.error(error?.message || "Failed to update snippet");
      throw error;
    }
  };

  return { updateSnippet };
};
