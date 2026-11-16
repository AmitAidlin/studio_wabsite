
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail } from "lucide-react";

interface AuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
  isLoading: boolean;
  isResendingEmail: boolean;
  needsEmailVerification: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleResendEmail: () => Promise<void>;
  isForgotPassword: boolean;
  setIsForgotPassword: (isForgotPassword: boolean) => void;
  isResetPasswordLoading: boolean;
  handleResetPassword: () => Promise<void>;
  isResetMode?: boolean;
}

export const AuthForm = ({
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
  isResetMode = false,
}: AuthFormProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isResetMode
            ? "Reset Your Password"
            : isForgotPassword 
              ? "Reset Password" 
              : isSignUp 
                ? "Create an Account" 
                : "Welcome Back"}
        </CardTitle>
        <CardDescription>
          {isResetMode
            ? "Enter a new password for your account"
            : isForgotPassword
              ? "Enter your email to receive a password reset link"
              : isSignUp
                ? "Sign up to access exclusive Aidlin Design content"
                : "Sign in to your Aidlin Design account"}
        </CardDescription>
      </CardHeader>
      {isForgotPassword ? (
        <div>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isResetPasswordLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="button"
              className="w-full"
              onClick={handleResetPassword}
              disabled={isResetPasswordLoading}
            >
              {isResetPasswordLoading ? "Sending..." : "Send Reset Link"}
              {isResetPasswordLoading ? null : <Mail className="ml-2" />}
            </Button>
            <p className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-primary hover:underline"
                disabled={isResetPasswordLoading}
              >
                Back to Sign In
              </button>
            </p>
          </CardFooter>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {needsEmailVerification && (
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Your email needs to be verified. Please check your inbox or click below to resend the verification email.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isResendingEmail}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isResendingEmail}
              />
            </div>
            {!isSignUp && !isResetMode && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {needsEmailVerification && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResendingEmail}
              >
                {isResendingEmail ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isResendingEmail}
            >
              {isLoading
                ? "Processing..."
                : isResetMode
                ? "Set New Password"
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
            {!isResetMode && (
              <p className="text-center text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                  }}
                  className="text-primary hover:underline"
                  disabled={isLoading || isResendingEmail}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            )}
          </CardFooter>
        </form>
      )}
    </Card>
  );
};
