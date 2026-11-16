
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

// Product image with additional info
type ProductImageWithDetails = {
  id: string;
  product_id: string;
  image_url: string;
  image_path: string | null;
  is_primary: boolean;
  display_order: number | null;
  product_name: string; // Added from join
};

const AdminProductImageList = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch all product images with product names
  const { data: productImages, isLoading, refetch } = useQuery({
    queryKey: ['allProductImages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select(`
          *,
          products:product_id (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Failed to load product images");
        throw error;
      }
      
      // Process images to get public URLs for images stored in Supabase storage
      const imagesWithUrls = await Promise.all((data || []).map(async (image) => {
        let imageUrl = image.image_url;
        
        if (image.image_path) {
          const { data: publicUrl } = supabase.storage
            .from('product-images')
            .getPublicUrl(image.image_path);
          imageUrl = publicUrl.publicUrl;
        }
        
        return {
          ...image,
          image_url: imageUrl,
          product_name: image.products?.name || 'Unknown Product'
        };
      }));
      
      return imagesWithUrls as ProductImageWithDetails[];
    }
  });

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOpenDialog(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-light mb-6">All Product Images</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-studio-terracotta" />
        </div>
      ) : productImages && productImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div 
                className="aspect-square bg-gray-200 cursor-pointer" 
                onClick={() => handleImageClick(image.image_url)}
              >
                <img 
                  src={image.image_url} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{image.product_name}</p>
                <div className="flex items-center mt-1">
                  {image.is_primary && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {image.image_path ? `Storage: ${image.image_path}` : 'External URL'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No product images found.</p>
        </div>
      )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-200 p-2">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Product" 
                className="max-w-full max-h-[70vh] mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductImageList;
