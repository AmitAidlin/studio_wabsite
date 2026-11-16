
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);
  const { signIn, signUp, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNeedsEmailVerification(false);

    try {
      if (isSignUp) {
        const { error, user } = await signUp(email, password);
        if (error) {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        } else if (user) {
          toast({
            title: "Registration successful",
            description: "Please check your email for verification.",
          });
          setNeedsEmailVerification(true);
        }
      } else {
        const { error, isEmailConfirmed } = await signIn(email, password);
        if (error) {
          if (isEmailConfirmed === false) {
            setNeedsEmailVerification(true);
            toast({
              title: "Email not verified",
              description: "Please check your inbox for the verification email or resend it.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/");
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsResendingEmail(true);
    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) {
        toast({
          title: "Failed to resend email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification email.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description: "Failed to resend the verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setIsResetPasswordLoading(true);
    try {
      // Build an absolute URL with the current domain
      // Use window.location.href to get the full current URL
      // Then extract just the origin (domain) part
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth?reset=true`;
      
      console.log("Reset password redirect URL:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Please check your inbox for the password reset link.",
        });
        setIsForgotPassword(false);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "An error occurred",
        description: "Failed to send the password reset email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResetPasswordLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSignUp,
    setIsSignUp,
    isLoading,
    isResendingEmail,
    needsEmailVerification,
    setNeedsEmailVerification,
    handleSubmit,
    handleResendEmail,
    isForgotPassword,
    setIsForgotPassword,
    isResetPasswordLoading,
    handleResetPassword,
  };
};
