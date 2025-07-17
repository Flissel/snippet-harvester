
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
    <header className="glass border-b border-border/50 px-8 py-4 flex items-center justify-between backdrop-blur-md">
      <h1 className="text-2xl font-bold gradient-text">
        Snippet Harvester
      </h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-sm text-muted-foreground bg-card/50 px-3 py-1 rounded-full border border-border/30">
              {user.email}
            </div>
            <Button onClick={handleLogout} variant="outline" className="btn-glass">
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
