
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { RegistrationStep, OrganizationSetup, UserRegistration, TeamInvite } from "@/types/auth";

export function useAuthFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("organization");
  
  const [orgData, setOrgData] = useState<OrganizationSetup>({
    name: "",
    description: "",
  });
  
  const [userData, setUserData] = useState<UserRegistration>({
    email: "",
    password: "",
    displayName: "",
  });
  
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

      // Step 1: Create user account first
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            display_name: userData.displayName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Step 2: Create organization
      const { data: orgResult, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgData.name,
            description: orgData.description,
            created_by: authData.user.id,
          },
        ])
        .select()
        .single();

      if (orgError) throw orgError;

      // Step 3: Create organization member entry (admin role)
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert([
          {
            organization_id: orgResult.id,
            user_id: authData.user.id,
            role: "admin",
          },
        ]);

      if (memberError) throw memberError;

      // Step 4: Update profile with last used organization
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ last_used_organization_id: orgResult.id })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      toast.success("Account created successfully! Please check your email to confirm your account.");
      setIsSignUp(false);
      resetForm();
    } catch (error: any) {
      console.error("Signup error:", error);
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

  return {
    isLoading,
    isSignUp,
    currentStep,
    orgData,
    userData,
    inviteData,
    setIsSignUp,
    setOrgData,
    setUserData,
    setInviteData,
    handleAuth,
    handleBack,
    resetForm,
  };
}
