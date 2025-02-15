
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Snippet Harvester</h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
