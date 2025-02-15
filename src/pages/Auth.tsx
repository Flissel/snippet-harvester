
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UserRegistrationStep } from "@/components/auth/UserRegistrationStep";
import { OrganizationSetupStep } from "@/components/auth/OrganizationSetupStep";
import { TeamInviteStep } from "@/components/auth/TeamInviteStep";
import type { RegistrationStep, OrganizationSetup, TeamInvite } from "@/types/auth";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("user");
  
  // User registration data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  // Organization setup data
  const [orgData, setOrgData] = useState<OrganizationSetup>({
    name: "",
    description: "",
  });
  
  // Team invite data
  const [inviteData, setInviteData] = useState<TeamInvite>({
    emails: [],
  });

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.includes("Email not confirmed") || error.message.includes("Invalid login credentials")) {
          throw new Error("Please check your email and confirm your account before signing in. If you've already confirmed, make sure your credentials are correct.");
        }
        throw error;
      }
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      // Step 1: Create user account
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      if (signUpError) throw signUpError;

      // Step 2: Create organization
      const { error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgData.name,
            description: orgData.description,
            created_by: data.user?.id,
          },
        ])
        .select()
        .single();

      if (orgError) throw orgError;

      toast.success("Account created successfully! Please check your email to confirm your account.");
      setIsSignUp(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setOrgData({ name: "", description: "" });
    setInviteData({ emails: [] });
    setCurrentStep("user");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (currentStep === "user" && email && password && username) {
          setCurrentStep("organization");
        } else if (currentStep === "organization" && orgData.name) {
          setCurrentStep("invite");
        } else if (currentStep === "invite") {
          await handleSignUp();
        }
      } else {
        await handleSignIn();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "organization") {
      setCurrentStep("user");
    } else if (currentStep === "invite") {
      setCurrentStep("organization");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isSignUp
              ? currentStep === "user"
                ? "Create an account"
                : currentStep === "organization"
                ? "Set up your organization"
                : "Invite team members"
              : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? currentStep === "user"
                ? "Enter your details to create a new account"
                : currentStep === "organization"
                ? "Tell us about your organization"
                : "Invite your team members to join (optional)"
              : "Enter your credentials to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp ? (
              <>
                {currentStep === "user" && (
                  <UserRegistrationStep
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    username={username}
                    setUsername={setUsername}
                  />
                )}
                {currentStep === "organization" && (
                  <OrganizationSetupStep
                    data={orgData}
                    onChange={setOrgData}
                  />
                )}
                {currentStep === "invite" && (
                  <TeamInviteStep
                    data={inviteData}
                    onChange={setInviteData}
                  />
                )}
                <div className="flex gap-2">
                  {currentStep !== "user" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Loading..."
                      : currentStep === "invite"
                      ? "Create account"
                      : "Continue"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <UserRegistrationStep
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  username={username}
                  setUsername={setUsername}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Sign in"}
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                resetForm();
              }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
