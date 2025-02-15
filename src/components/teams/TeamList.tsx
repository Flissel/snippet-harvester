
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export function TeamList() {
  const { user } = useAuth();

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      if (!user) throw new Error("User must be authenticated");
      
      // Simple query that relies on RLS policies
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          teams (
            id,
            name,
            description
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Transform the data to get just the teams
      return data.map(item => item.teams).filter(Boolean);
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams?.map((team) => (
        <Card key={team.id} className="p-4">
          <h3 className="text-lg font-semibold">{team.name}</h3>
          {team.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {team.description}
            </p>
          )}
        </Card>
      ))}
      {teams?.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          You are not a member of any teams yet.
        </p>
      )}
    </div>
  );
}
