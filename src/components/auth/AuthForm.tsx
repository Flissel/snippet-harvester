
import { Button } from "@/components/ui/button";
import { UserRegistrationStep } from "@/components/auth/UserRegistrationStep";
import { OrganizationSetupStep } from "@/components/auth/OrganizationSetupStep";
import { TeamInviteStep } from "@/components/auth/TeamInviteStep";
import type { RegistrationStep, OrganizationSetup, UserRegistration, TeamInvite } from "@/types/auth";

interface AuthFormProps {
  isLoading: boolean;
  isSignUp: boolean;
  currentStep: RegistrationStep;
  orgData: OrganizationSetup;
  userData: UserRegistration;
  inviteData: TeamInvite;
  onOrgDataChange: (data: OrganizationSetup) => void;
  onUserDataChange: (data: UserRegistration) => void;
  onInviteDataChange: (data: TeamInvite) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onToggleMode: () => void;
}

export function AuthForm({
  isLoading,
  isSignUp,
  currentStep,
  orgData,
  userData,
  inviteData,
  onOrgDataChange,
  onUserDataChange,
  onInviteDataChange,
  onSubmit,
  onBack,
  onToggleMode,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignUp ? (
        <>
          {currentStep === "organization" && (
            <OrganizationSetupStep
              data={orgData}
              onChange={onOrgDataChange}
            />
          )}
          {currentStep === "user" && (
            <UserRegistrationStep
              data={userData}
              onChange={onUserDataChange}
            />
          )}
          {currentStep === "invite" && (
            <TeamInviteStep
              data={inviteData}
              onChange={onInviteDataChange}
            />
          )}
          <div className="flex gap-2">
            {currentStep !== "organization" && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
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
            onChange={onUserDataChange}
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
        onClick={onToggleMode}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </Button>
    </form>
  );
}
