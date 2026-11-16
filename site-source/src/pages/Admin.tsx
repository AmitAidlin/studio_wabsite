
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Admin = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page.",
        variant: "destructive",
      });
    } else if (!isLoading && !isAdmin) {
      navigate("/");
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
    }
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Additional check to prevent render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>
              Welcome to your admin dashboard. This area is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                You are currently logged in as an administrator.
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="font-medium mb-2">User Information:</h3>
              <p className="text-sm text-muted-foreground mb-1">Email: {user?.email}</p>
              <p className="text-sm text-muted-foreground mb-1">User ID: {user?.id}</p>
              <p className="text-sm text-muted-foreground">Last Sign In: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Admin Controls</h3>
              <div className="space-y-2">
                {/* Updated admin controls with functioning links */}
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  asChild
                >
                  <Link to="/admin/products">Manage Products & Images</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              This is a restricted area. All actions are logged and monitored.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
