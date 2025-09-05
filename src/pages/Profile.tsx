
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";

export default function Profile() {
  const { user, loading, initialized } = useAuth();

  console.log("Profile page auth state:", {
    user,
    loading,
    initialized,
    userId: user?.id,
  });

  // Show loading state while authentication is initializing
  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user && initialized) {
    console.log("No user found, redirecting to auth page");
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your account settings</p>
      </div>
      
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <p className="text-muted-foreground text-sm sm:text-base break-all">{user?.email}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">User ID</label>
            <p className="text-muted-foreground text-xs sm:text-sm font-mono break-all">{user?.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
