import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CURRENCY, productImageUrl, shopProducts } from "@/data/products";

const Products = () => {
  const { add, lines } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goToContact = () => {
    navigate("/");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {shopProducts.map((product) => (
              <Card key={product.id} className="border-none shadow-sm overflow-hidden flex flex-col">
                <img
                  src={productImageUrl(product.image)}
                  alt={product.name}
                  className="w-full aspect-square object-cover object-[50%_75%] bg-gray-100"
                />
                <CardContent className="pt-5 flex-1">
                  {product.oneOfAKind && (
                    <span className="inline-block text-xs tracking-widest uppercase text-studio-gray mb-2">One of a kind</span>
                  )}
                  <h3 className="font-light text-xl">{product.name}</h3>
                  <p className="text-studio-terracotta font-medium text-lg mt-1">
                    {CURRENCY}
                    {product.price}
                  </p>
                  <p className="text-gray-600 mt-3 text-sm leading-relaxed">{product.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite py-2 rounded-sm font-light flex items-center gap-2"
                    onClick={() => {
                      const inCart = lines.some((l) => l.id === product.id);
                      if (product.oneOfAKind && inCart) {
                        toast("Already in your cart", { description: "This piece is one of a kind." });
                        return;
                      }
                      add(product.id);
                      toast.success("Added to cart", { description: product.name });
                    }}
                  >
                    <ShoppingBag size={16} /> Add to cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Custom Orders */}
          <div className="bg-gray-100 p-8 rounded-sm mt-16">
            <h2 className="text-2xl font-light mb-4">CUSTOM ORDERS</h2>
            <p className="mb-6 text-gray-600">
              We offer custom ceramic manufacturing services for designers, architects, and brands.
              Contact us to discuss your project requirements and explore the possibilities of 3D printed ceramics.
            </p>
            <Button
              className="bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite py-3 px-6 rounded-sm text-base font-light flex items-center gap-2"
              onClick={goToContact}
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
