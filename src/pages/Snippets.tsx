
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { SnippetFormModal } from "@/components/SnippetFormModal";
import { SnippetViewModal } from "@/components/SnippetViewModal";
import { SnippetList } from "@/components/snippets/SnippetList";
import { SnippetDetailModal } from "@/components/snippets/SnippetDetailModal";
import { toast } from "sonner";
import { Snippet } from "@/types/snippets";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Snippets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [focusedSnippet, setFocusedSnippet] = useState<Snippet | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !loading && !user) {
      console.log("No authenticated user, redirecting to auth");
      navigate("/auth");
    }
  }, [user, loading, initialized, navigate]);

  console.log("Snippets component state:", {
    userExists: !!user,
    authLoading: loading,
    authInitialized: initialized,
    userId: user?.id
  });

  const { data: snippets, isLoading, error } = useQuery({
    queryKey: ["snippets"],
    queryFn: async () => {
      if (!user) {
        throw new Error("User must be authenticated to fetch snippets");
      }

      console.log("Fetching snippets for user:", user.id);
      const { data, error } = await supabase
        .from("snippets")
        .select(`
          *,
          profiles:created_by(username, avatar_url, is_admin),
          teams:team_id(name),
          snippet_label_associations(
            snippet_labels:label_id(name, color)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error);
        throw error;
      }
      
      console.log("Fetched snippets:", data);

      // Transform the data to ensure complexity_level is of the correct type
      const typedData = data?.map(snippet => ({
        ...snippet,
        complexity_level: (snippet.complexity_level || 'beginner') as Snippet['complexity_level']
      })) as Snippet[];

      return typedData;
    },
    enabled: !!user && initialized && !loading,
  });

  // Only show loading state during initial auth check
  if (!initialized) {
    console.log("Auth not initialized yet");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  const filteredSnippets = snippets?.filter((snippet) =>
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (snippet: Snippet) => {
    setFocusedSnippet(focusedSnippet?.id === snippet.id ? null : snippet);
    setExpandedCardId(expandedCardId === snippet.id ? null : snippet.id);
  };

  const handleCopyCode = async (code: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSnippetId(snippetId);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="text-red-500">
              Error loading snippets: {error.message}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background relative">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search snippets..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SnippetFormModal />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SnippetList
              snippets={filteredSnippets}
              isLoading={isLoading}
              expandedCardId={expandedCardId}
              copiedSnippetId={copiedSnippetId}
              focusedSnippetId={focusedSnippet?.id || null}
              onSnippetExpand={handleCardClick}
              onSnippetCopy={handleCopyCode}
            />
          </div>
          {selectedSnippet && (
            <SnippetViewModal
              isOpen={!!selectedSnippet}
              onClose={() => setSelectedSnippet(null)}
              snippet={selectedSnippet}
            />
          )}
          {focusedSnippet && (
            <SnippetDetailModal
              snippet={focusedSnippet}
              onClose={() => setFocusedSnippet(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Snippets;
