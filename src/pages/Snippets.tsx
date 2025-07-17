import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Search, Sparkles, Code2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Snippets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [focusedSnippet, setFocusedSnippet] = useState<Snippet | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialized && !loading && !user) {
      console.log("No authenticated user, redirecting to auth");
      navigate("/auth");
    }
  }, [user, loading, initialized, navigate]);

  const { data: snippets, isLoading, error } = useQuery({
    queryKey: ["snippets"],
    queryFn: async () => {
      if (!user) {
        throw new Error("User must be authenticated to fetch snippets");
      }

      console.log("Fetching snippets for user:", user.id);
      
      const { data, error } = await supabase
        .from("snippets")
        .select()
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error);
        throw error;
      }
      
      console.log("Fetched snippets:", data);
      return data as Snippet[];
    },
    enabled: !!user && initialized && !loading,
    staleTime: 1000, // Consider data fresh for 1 second
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredSnippets = snippets?.filter((snippet) =>
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (snippet: Snippet) => {
    // Get the latest data from the query cache
    const currentSnippets = queryClient.getQueryData<Snippet[]>(["snippets"]);
    const updatedSnippet = currentSnippets?.find(s => s.id === snippet.id);
    
    if (updatedSnippet) {
      setFocusedSnippet(focusedSnippet?.id === updatedSnippet.id ? null : updatedSnippet);
      setExpandedCardId(expandedCardId === updatedSnippet.id ? null : updatedSnippet.id);
    }
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

  const handleSnippetAnalyze = (snippet: Snippet) => {
    navigate(`/analyze/${snippet.id}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-8">
            <div className="card-enhanced rounded-xl p-6 text-center">
              <div className="text-destructive text-xl mb-2">⚠️ Error</div>
              <p className="text-muted-foreground">
                Error loading snippets: {error.message}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 space-y-8">
          {/* Hero Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-2xl blur-xl"></div>
            <div className="relative card-enhanced rounded-2xl p-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10 animate-glow">
                  <Code2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">
                  Code Snippets
                </h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Organize, analyze, and transform your code snippets with AI-powered insights
              </p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search snippets..."
                className="pl-10 glass border-border/50 focus:border-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SnippetFormModal />
          </div>

          {/* Stats */}
          {snippets && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-enhanced rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {snippets.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Snippets</div>
              </div>
              <div className="card-enhanced rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {new Set(snippets.map(s => s.language)).size}
                </div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div className="card-enhanced rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {filteredSnippets?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </div>
            </div>
          )}

          {/* Snippets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SnippetList
              snippets={filteredSnippets}
              isLoading={isLoading}
              expandedCardId={expandedCardId}
              copiedSnippetId={copiedSnippetId}
              focusedSnippetId={focusedSnippet?.id || null}
              onSnippetExpand={handleCardClick}
              onSnippetCopy={handleCopyCode}
              onSnippetAnalyze={handleSnippetAnalyze}
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
