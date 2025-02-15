
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationList } from "@/components/organizations/OrganizationList";
import { CreateOrganizationModal } from "@/components/organizations/CreateOrganizationModal";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { user, loading, initialized } = useAuth();
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  console.log("Profile page auth state:", {
    user,
    loading,
    initialized,
    userId: user?.id,
  });

  // Show loading state while authentication is initializing
  if (loading || !initialized) {
    return <div>Loading...</div>;
  }

  // Redirect to auth page if not authenticated
  if (!user && initialized) {
    console.log("No user found, redirecting to auth page");
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="organizations" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="organizations">Organizations</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                </TabsList>
                <Button onClick={() => setIsCreateOrgModalOpen(true)}>
                  Create Organization
                </Button>
              </div>

              <TabsContent value="organizations" className="space-y-4">
                <OrganizationList />
              </TabsContent>

              <TabsContent value="teams" className="space-y-4">
                Coming soon...
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                Coming soon...
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <CreateOrganizationModal 
          open={isCreateOrgModalOpen}
          onOpenChange={setIsCreateOrgModalOpen}
        />
      </div>
    </div>
  );
}
