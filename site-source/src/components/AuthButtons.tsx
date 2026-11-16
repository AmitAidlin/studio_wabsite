
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const AuthButtons = () => {
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
              <Avatar>
                <AvatarFallback>{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <p className="text-muted-foreground mb-4">{user.email}</p>
              
              {/* Show Admin link only if user is admin */}
              {isAdmin && (
                <Button 
                  asChild
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
              )}
              
              <Button 
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                }}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link to="/auth">Sign In</Link>
    </Button>
  );
};
