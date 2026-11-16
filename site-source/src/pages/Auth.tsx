
import { useEffect } from "react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { AuthForm } from "@/components/auth/AuthForm";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSignUp,
    setIsSignUp,
    isLoading,
    isResendingEmail,
    needsEmailVerification,
    handleSubmit,
    handleResendEmail,
    isForgotPassword,
    setIsForgotPassword,
    isResetPasswordLoading,
    handleResetPassword,
  } = useAuthForm();
  
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get("reset") === "true";
  
  useEffect(() => {
    // Show a message when user returns from password reset link
    if (isResetMode) {
      toast({
        title: "Set your new password",
        description: "Enter your new password below to complete the reset process.",
      });
      setIsForgotPassword(false); // Make sure we're in login mode
    }
  }, [isResetMode, setIsForgotPassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <AuthForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        isLoading={isLoading}
        isResendingEmail={isResendingEmail}
        needsEmailVerification={needsEmailVerification}
        handleSubmit={handleSubmit}
        handleResendEmail={handleResendEmail}
        isForgotPassword={isForgotPassword}
        setIsForgotPassword={setIsForgotPassword}
        isResetPasswordLoading={isResetPasswordLoading}
        handleResetPassword={handleResetPassword}
        isResetMode={isResetMode}
      />
    </div>
  );
};

export default Auth;
