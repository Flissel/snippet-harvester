
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OrganizationRole } from "@/types/auth";

interface OrganizationMember {
  user_id: string;
  role: OrganizationRole;
}

interface Organization {
  id: string;
  name: string;
  description: string | null;
  organization_members: OrganizationMember[];
}

export function OrganizationList() {
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select(`
          *,
          organization_members (
            user_id,
            role
          )
        `);

      if (error) throw error;
      return data as Organization[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {organizations?.map((org) => (
        <Card key={org.id}>
          <CardHeader>
            <CardTitle>{org.name}</CardTitle>
            <CardDescription>{org.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {org.organization_members.length} members
              </p>
              {org.organization_members.some(member => member.role === 'admin') && (
                <Badge variant="secondary">Admin</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {!organizations?.length && (
        <p className="text-center text-muted-foreground py-8">
          No organizations found. Create one to get started!
        </p>
      )}
    </div>
  );
}

