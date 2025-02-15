
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

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

  console.log("Filtered snippets:", filteredSnippets);
  console.log("Error state:", error);

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
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search snippets..."
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 rounded-lg glass card-shadow">
                  <Skeleton className="h-32 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : filteredSnippets?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No snippets found</p>
              </div>
            ) : (
              filteredSnippets?.map((snippet, i) => (
                <div
                  key={snippet.id}
                  className="p-6 rounded-lg glass card-shadow animate-in"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="h-32 flex items-center justify-center bg-primary/5 rounded-md mb-4 overflow-hidden">
                    <pre className="text-xs text-primary/60 p-4 w-full overflow-hidden">
                      {snippet.code_content.slice(0, 200)}...
                    </pre>
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{snippet.title}</h3>
                    {snippet.teams && (
                      <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                        {snippet.teams.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {snippet.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {snippet.snippet_label_associations?.map(({ snippet_labels }) => (
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
                  <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <img
                      src={snippet.profiles?.avatar_url || "/placeholder.svg"}
                      alt={snippet.profiles?.username || "Anonymous"}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>{snippet.profiles?.username || "Anonymous"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
