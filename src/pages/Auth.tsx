
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const Auth = () => {
  const {
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
  } = useAuthFlow();

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
          <AuthForm
            isLoading={isLoading}
            isSignUp={isSignUp}
            currentStep={currentStep}
            orgData={orgData}
            userData={userData}
            inviteData={inviteData}
            onOrgDataChange={setOrgData}
            onUserDataChange={setUserData}
            onInviteDataChange={setInviteData}
            onSubmit={handleAuth}
            onBack={handleBack}
            onToggleMode={() => {
              setIsSignUp(!isSignUp);
              resetForm();
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
