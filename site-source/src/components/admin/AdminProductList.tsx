import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CheckIcon, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Product type definition
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  collection_id?: string; 
  created_at: string;
  updated_at: string;
  featured: boolean;
  etsy_listing_id?: string;
  etsy_url?: string;
  etsy_price?: number;
  etsy_status?: string;
  etsy_last_sync?: string;
}

interface Collection {
  id: string;
  title: string;
}

// Form schema for product editing
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  collection_id: z.string().optional(),
  featured: z.boolean().default(false),
  etsy_listing_id: z.string().optional(),
  etsy_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  etsy_price: z.coerce.number().min(0).optional(),
  etsy_status: z.enum(["active", "inactive", "draft", "expired", "sold_out", "none"]).optional(),
});

const AdminProductList = () => {
  const { isAdmin } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
      }
      return data as Product[];
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("id, title");
      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
      return data as Collection[];
    },
  });

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      collection_id: "none",
      featured: false,
      etsy_listing_id: "",
      etsy_url: "",
      etsy_price: undefined,
      etsy_status: "none",
    },
  });

  const newProductForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      collection_id: "none",
      featured: false,
      etsy_listing_id: "",
      etsy_url: "",
      etsy_price: undefined,
      etsy_status: "none",
    },
  });

  // Reset form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        collection_id: editingProduct.collection_id || "none",
        featured: editingProduct.featured,
        etsy_listing_id: editingProduct.etsy_listing_id || "",
        etsy_url: editingProduct.etsy_url || "",
        etsy_price: editingProduct.etsy_price,
        etsy_status: (editingProduct.etsy_status as any) || "none",
      });
    }
  }, [editingProduct, form]);

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true);
    setDeletingProductId(productId);
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error deleting product",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Product deleted",
          description: "Product deleted successfully.",
        });
        setSuccessMessage("Product deleted successfully.");
        setShowSuccessDialog(true);
        refetch();
      }
    } finally {
      setIsDeleting(false);
      setDeletingProductId(null);
    }
  };

  const handleEditSubmit = async (data: z.infer<typeof productSchema>) => {
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          collection_id: data.collection_id === "none" ? null : data.collection_id,
          featured: data.featured,
          etsy_listing_id: data.etsy_listing_id || null,
          etsy_url: data.etsy_url || null,
          etsy_price: data.etsy_price || null,
          etsy_status: data.etsy_status === "none" ? null : data.etsy_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProduct.id);

      if (error) {
        console.error("Error updating product:", error);
        toast({
          title: "Error updating product",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Product updated",
          description: "Product updated successfully.",
        });
        setEditingProduct(null);
        refetch();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (data: z.infer<typeof productSchema>) => {
    console.log("Creating product with data:", data);
    setIsSubmitting(true);
    try {
      // Check if user is authenticated and admin using AuthContext
      if (!isAdmin) {
        console.error("User is not an admin");
        toast({
          title: "Access denied",
          description: "Only admins can create products.",
          variant: "destructive",
        });
        return;
      }

      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: data.name,
          description: data.description,
          price: data.price,
          collection_id: data.collection_id === "none" ? null : data.collection_id,
          featured: data.featured,
          etsy_listing_id: data.etsy_listing_id || null,
          etsy_url: data.etsy_url || null,
          etsy_price: data.etsy_price || null,
          etsy_status: data.etsy_status === "none" ? null : data.etsy_status,
        })
        .select();

      if (error) {
        console.error("Error creating product:", error);
        toast({
          title: "Error creating product",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("Product created successfully:", newProduct);
        toast({
          title: "Product created",
          description: "Product created successfully.",
        });
        newProductForm.reset();
        refetch();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEtsyFields = (formInstance: any) => (
    <>
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Etsy Integration</h4>
        
        <FormField
          control={formInstance.control}
          name="etsy_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etsy URL</FormLabel>
              <FormControl>
                <Input placeholder="https://www.etsy.com/listing/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={formInstance.control}
          name="etsy_listing_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etsy Listing ID</FormLabel>
              <FormControl>
                <Input placeholder="1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={formInstance.control}
            name="etsy_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etsy Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={formInstance.control}
            name="etsy_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etsy Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Product List</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-studio-terracotta hover:bg-studio-terracotta/90">Add New Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product.
              </DialogDescription>
            </DialogHeader>
            <Form {...newProductForm}>
              <form onSubmit={newProductForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={newProductForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newProductForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Product description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newProductForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newProductForm.control}
                  name="collection_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {collections?.map((collection) => (
                            <SelectItem key={collection.id} value={collection.id}>
                              {collection.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newProductForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Product</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This product will be highlighted on the homepage
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {renderEtsyFields(newProductForm)}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-2/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the products. Please try again.</p>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : products?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Products Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no products in the database yet. Add your first product to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {product.name}
                  {product.etsy_url && (
                    <a 
                      href={product.etsy_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </CardTitle>
                <CardDescription>
                  {collections?.find(c => c.id === product.collection_id)?.title || 'No Collection'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{product.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                  {product.etsy_price && (
                    <p className="text-sm text-orange-600">Etsy: ${product.etsy_price.toFixed(2)}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.featured && (
                    <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Featured
                    </div>
                  )}
                  {product.etsy_status && (
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.etsy_status === 'active' ? 'bg-green-100 text-green-800' :
                      product.etsy_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      product.etsy_status === 'sold_out' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      Etsy: {product.etsy_status}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingProduct(product)}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                      <DialogDescription>
                        Make changes to the product details.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="collection_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Collection</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a collection" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {collections?.map((collection) => (
                                    <SelectItem key={collection.id} value={collection.id}>
                                      {collection.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Featured Product</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  This product will be highlighted on the homepage
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {renderEtsyFields(form)}
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={isDeleting}
                >
                  {isDeleting && deletingProductId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckIcon className="mr-2 h-5 w-5" />
              Success!
            </DialogTitle>
          </DialogHeader>
          <p>{successMessage}</p>
          <Button 
            className="bg-green-600 hover:bg-green-700 mt-2"
            onClick={() => setShowSuccessDialog(false)}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductList;
