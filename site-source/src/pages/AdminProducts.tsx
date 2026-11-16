
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon, Check, X, Eye } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AdminProductImageUpload from "@/components/admin/AdminProductImageUpload";
import AdminProductImageList from "@/components/admin/AdminProductImageList";
import AdminProductList from "@/components/admin/AdminProductList";

const AdminProducts = () => {
  const { isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isAdmin, isLoading, navigate, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studio-terracotta" />
      </div>
    );
  }
  
  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20 px-6 md:px-12 lg:px-24 bg-studio-offwhite">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-studio-dark mb-2 tracking-wider">
            ADMIN <span className="text-studio-terracotta">PRODUCTS</span> MANAGEMENT
          </h1>
          <p className="text-lg text-gray-600 mb-12">Manage products and their images</p>
          
          <Separator className="mb-12" />
          
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="images">Product Images</TabsTrigger>
              <TabsTrigger value="upload">Upload New Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <AdminProductList />
            </TabsContent>
            
            <TabsContent value="images">
              <AdminProductImageList />
            </TabsContent>
            
            <TabsContent value="upload">
              <AdminProductImageUpload />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProducts;
