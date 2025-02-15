
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { SnippetFormModal } from "@/components/SnippetFormModal";
import { SnippetViewModal } from "@/components/SnippetViewModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnippet, setSelectedSnippet] = useState<any>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const { data: snippets, isLoading, error } = useQuery({
    queryKey: ["snippets"],
    queryFn: async () => {
      console.log("Fetching snippets...");
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
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error);
        throw error;
      }
      console.log("Fetched snippets:", data);
      return data;
    },
  });

  const filteredSnippets = snippets?.filter((snippet) =>
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (snippetId: string) => {
    setExpandedCardId(expandedCardId === snippetId ? null : snippetId);
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
    <div className="min-h-screen flex bg-background">
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))
            ) : filteredSnippets?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No snippets found</p>
              </div>
            ) : (
              filteredSnippets?.map((snippet) => (
                <Card 
                  key={snippet.id} 
                  className="group relative transition-all duration-200 cursor-pointer hover:shadow-md"
                  onClick={() => handleCardClick(snippet.id)}
                >
                  <CardHeader>
                    <CardTitle>{snippet.title}</CardTitle>
                    <CardDescription>{snippet.description}</CardDescription>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSnippet(snippet);
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  {expandedCardId === snippet.id && (
                    <CardContent className="border-t pt-4 space-y-4 animate-slide-up">
                      {snippet.teams && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Team:</span>
                          <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                            {snippet.teams.name}
                          </span>
                        </div>
                      )}
                      {snippet.snippet_label_associations?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {snippet.snippet_label_associations.map(({ snippet_labels }) => (
                            <span
                              key={snippet_labels.name}
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: `${snippet_labels.color}20`,
                                color: snippet_labels.color,
                              }}
                            >
                              {snippet_labels.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <img
                          src={snippet.profiles?.avatar_url || "/placeholder.svg"}
                          alt={snippet.profiles?.username || "Anonymous"}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-muted-foreground">
                          {snippet.profiles?.username || "Anonymous"}
                        </span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
          {selectedSnippet && (
            <SnippetViewModal
              isOpen={!!selectedSnippet}
              onClose={() => setSelectedSnippet(null)}
              snippet={selectedSnippet}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
