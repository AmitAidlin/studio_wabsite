
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const formSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size < 5000000, "Image must be less than 5MB"),
  altText: z.string().min(3, { message: "Alt text must be at least 3 characters" }).max(100),
  productId: z.string().optional(),
});

// Interface for products
interface Product {
  id: string;
  name: string;
}

const AdminProductImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch product list for dropdown
  const { data: products } = useQuery({
    queryKey: ["products-for-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name");
        
      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }
      return data as Product[];
    },
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      altText: "",
      productId: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setUploading(true);
    
    try {
      if (!data.file) {
        toast({
          title: "Error",
          description: "Please select an image to upload.",
          variant: "destructive",
        });
        return;
      }

      const imageName = `${uuidv4()}-${data.file.name}`;
      
      // Check if 'product-images' bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'product-images');
      
      if (!bucketExists) {
        const { error: bucketError } = await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          toast({
            title: "Storage error",
            description: "Could not create storage bucket. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Upload the image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(imageName, data.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload failed",
          description: "There was an error uploading the image.",
          variant: "destructive",
        });
        return;
      }

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(imageName);
      
      const imageUrl = publicUrlData.publicUrl;

      // Insert record into product_images table
      const { error: insertError } = await supabase
        .from('product_images')
        .insert({
          image_url: imageUrl, 
          image_path: imageName,
          product_id: data.productId || null,
          alt_text: data.altText,
          is_primary: false,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        toast({
          title: "Database error",
          description: "Failed to save image details to the database.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Image uploaded and saved successfully!",
      });
      form.reset();
      setPreviewUrl(null);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred during the process.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-medium">Upload New Product Image</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="grid gap-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-studio-terracotta transition-colors"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          {previewUrl ? (
                            <div className="w-full">
                              <AspectRatio ratio={1} className="overflow-hidden rounded-md bg-gray-100">
                                <img 
                                  src={previewUrl} 
                                  alt="Preview" 
                                  className="h-full w-full object-cover" 
                                />
                              </AspectRatio>
                            </div>
                          ) : (
                            <>
                              <div className="p-4 rounded-full bg-gray-100 mb-2">
                                <ImageIcon className="h-8 w-8 text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP (max 5MB)</p>
                            </>
                          )}
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPreviewUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            {...rest}
                          />
                        </div>
                        
                        {previewUrl && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setPreviewUrl(null);
                              form.resetField("file");
                            }}
                          >
                            Remove Image
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="altText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Descriptive text for the image..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associate with Product</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="bg-studio-terracotta hover:bg-studio-terracotta/90" 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductImageUpload;
