
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UserRegistrationStep } from "@/components/auth/UserRegistrationStep";
import { OrganizationSetupStep } from "@/components/auth/OrganizationSetupStep";
import { TeamInviteStep } from "@/components/auth/TeamInviteStep";
import type { RegistrationStep, OrganizationSetup, UserRegistration, TeamInvite } from "@/types/auth";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("organization");
  
  // Organization setup data
  const [orgData, setOrgData] = useState<OrganizationSetup>({
    name: "",
    description: "",
  });
  
  // User registration data
  const [userData, setUserData] = useState<UserRegistration>({
    email: "",
    password: "",
    displayName: "",
  });
  
  // Team invite data
  const [inviteData, setInviteData] = useState<TeamInvite>({
    emails: [],
  });

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
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
      setIsLoading(true);

      // Step 1: Create organization
      const { data: orgResult, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgData.name,
            description: orgData.description,
          },
        ])
        .select()
        .single();

      if (orgError) throw orgError;

      // Step 2: Create user account with metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            display_name: userData.displayName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Step 3: Create organization member entry (admin role)
      if (data.user) {
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert([
            {
              organization_id: orgResult.id,
              user_id: data.user.id,
              role: "admin",
            },
          ]);

        if (memberError) throw memberError;

        // Step 4: Update profile with last used organization
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ last_used_organization_id: orgResult.id })
          .eq("id", data.user.id);

        if (profileError) throw profileError;
      }

      toast.success("Account created successfully! Please check your email to confirm your account.");
      setIsSignUp(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUserData({ email: "", password: "", displayName: "" });
    setOrgData({ name: "", description: "" });
    setInviteData({ emails: [] });
    setCurrentStep("organization");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (currentStep === "organization" && orgData.name) {
          setCurrentStep("user");
        } else if (currentStep === "user" && userData.email && userData.password && userData.displayName) {
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
    if (currentStep === "user") {
      setCurrentStep("organization");
    } else if (currentStep === "invite") {
      setCurrentStep("user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isSignUp
              ? currentStep === "organization"
                ? "Create your organization"
                : currentStep === "user"
                ? "Create your account"
                : "Invite team members"
              : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? currentStep === "organization"
                ? "First, tell us about your organization"
                : currentStep === "user"
                ? "Now, set up your account"
                : "Invite your team members to join (optional)"
              : "Enter your credentials to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp ? (
              <>
                {currentStep === "organization" && (
                  <OrganizationSetupStep
                    data={orgData}
                    onChange={setOrgData}
                  />
                )}
                {currentStep === "user" && (
                  <UserRegistrationStep
                    data={userData}
                    onChange={setUserData}
                  />
                )}
                {currentStep === "invite" && (
                  <TeamInviteStep
                    data={inviteData}
                    onChange={setInviteData}
                  />
                )}
                <div className="flex gap-2">
                  {currentStep !== "organization" && (
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
                  data={userData}
                  onChange={setUserData}
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

