
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import EtsyButton from "@/components/EtsyButton";

// Collection type definition
type Collection = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
};

// Product type definition
type Product = {
  id: string;
  collection_id: string | null;
  name: string;
  description: string | null;
  price: number;
  featured: boolean;
  image_url?: string;
  image_path?: string;
  etsy_listing_id?: string;
  etsy_url?: string;
  etsy_price?: number;
  etsy_status?: string;
  etsy_last_sync?: string;
};

const Products = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch collections
  const { data: collections, isLoading: isLoadingCollections, error: collectionsError } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*');
      
      if (error) throw error;
      
      // Process collections to get public URLs for images stored in Supabase storage
      const collectionsWithImages = await Promise.all((data || []).map(async (collection) => {
        if (collection.image_path) {
          const { data: publicUrl } = supabase.storage
            .from('product-images')
            .getPublicUrl(collection.image_path);
            
          return {
            ...collection,
            image_url: publicUrl.publicUrl
          };
        }
        return collection;
      }));
      
      return collectionsWithImages as Collection[];
    }
  });

  // Fetch featured products with their primary images
  const { data: featuredProducts, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      // First get all featured products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(4);
      
      if (productsError) throw productsError;
      
      // Then get their primary images
      if (products && products.length > 0) {
        const productsWithImages = await Promise.all(products.map(async (product) => {
          const { data: images } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', product.id)
            .eq('is_primary', true)
            .limit(1);
          
          let imageUrl;
          if (images && images.length > 0) {
            if (images[0].image_path) {
              const { data: publicUrl } = supabase.storage
                .from('product-images')
                .getPublicUrl(images[0].image_path);
                
              imageUrl = publicUrl.publicUrl;
            } else {
              imageUrl = images[0].image_url;
            }
          }
          
          return {
            ...product,
            image_url: imageUrl
          };
        }));
        
        return productsWithImages as Product[];
      }
      
      return [] as Product[];
    }
  });

  // Handle errors
  useEffect(() => {
    if (collectionsError) {
      toast.error("Failed to load collections", {
        description: "Please try again later."
      });
      console.error("Collections error:", collectionsError);
    }
    
    if (productsError) {
      toast.error("Failed to load products", {
        description: "Please try again later."
      });
      console.error("Products error:", productsError);
    }
  }, [collectionsError, productsError]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20 px-6 md:px-12 lg:px-24 bg-studio-offwhite">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-studio-dark mb-2 tracking-wider">
            <span className="text-studio-terracotta">CERAMIC</span> PRODUCTS
          </h1>
          <p className="text-lg text-gray-600 mb-12">Discover our collection of 3D printed ceramic pieces</p>
          
          <Separator className="mb-12" />
          
          {/* Collection Categories */}
          {isLoadingCollections ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-studio-terracotta" />
            </div>
          ) : collections && collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {collections.map((collection) => (
                <Card key={collection.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="aspect-square bg-gray-200">
                    <img 
                      src={collection.image_url || "https://via.placeholder.com/800x800?text=No+Image"} 
                      alt={collection.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-6 pb-4">
                    <h3 className="text-2xl font-light mb-2">{collection.title}</h3>
                    <p className="text-gray-600">{collection.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite py-2 px-4 rounded-sm text-sm font-light flex items-center gap-2"
                    >
                      View Collection <ArrowRight size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No collections found.</p>
            </div>
          )}
          
          {/* Featured Products */}
          <h2 className="text-2xl font-light mb-6 tracking-wider">FEATURED PRODUCTS</h2>
          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-studio-terracotta" />
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="border-none shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-200">
                    <img 
                      src={product.image_url || "https://via.placeholder.com/800x800?text=No+Image"} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-light text-lg">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-studio-terracotta font-medium">${product.price}</p>
                      {product.etsy_price && product.etsy_price !== product.price && (
                        <p className="text-sm text-orange-600">Etsy: ${product.etsy_price}</p>
                      )}
                    </div>
                    
                    {/* Etsy Status Badge */}
                    {product.etsy_status && (
                      <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-2 ${
                        product.etsy_status === 'active' ? 'bg-green-100 text-green-800' :
                        product.etsy_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        product.etsy_status === 'sold_out' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.etsy_status === 'active' ? 'Available on Etsy' :
                         product.etsy_status === 'sold_out' ? 'Sold Out' :
                         `Etsy: ${product.etsy_status}`}
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Etsy Button */}
                  {product.etsy_url && (
                    <CardFooter className="pt-0">
                      <EtsyButton 
                        url={product.etsy_url}
                        status={product.etsy_status}
                        price={product.etsy_price}
                        className="w-full text-sm"
                      />
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No featured products found.</p>
            </div>
          )}
          
          {/* Custom Orders */}
          <div className="bg-gray-100 p-8 rounded-sm mt-16">
            <h2 className="text-2xl font-light mb-4">CUSTOM ORDERS</h2>
            <p className="mb-6 text-gray-600">
              We offer custom ceramic manufacturing services for designers, architects, and brands. 
              Contact us to discuss your project requirements and explore the possibilities of 3D printed ceramics.
            </p>
            <Button 
              className="bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite py-3 px-6 rounded-sm text-base font-light flex items-center gap-2" 
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get in Touch <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
