import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { CURRENCY, productImageUrl } from "@/data/products";

const ORDER_EMAIL = "Aidlin427@gmail.com";

const CartDrawer = () => {
  const { lines, total, isOpen, setOpen, setQty, remove } = useCart();

  // No payment server on a static site: the order is sent to the studio by email.
  const checkout = () => {
    const body = [
      "Hi Aidlin Design, I'd like to order:",
      "",
      ...lines.map((l) => `- ${l.product.name} x ${l.qty} = ${CURRENCY}${l.qty * l.product.price}`),
      "",
      `Total: ${CURRENCY}${total}`,
      "",
      "My name / phone / delivery address:",
    ].join("\n");
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent("New order")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-light tracking-wider">YOUR CART</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <p className="text-gray-500 mt-10 text-center">Your cart is empty.</p>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y mt-4">
            {lines.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-4 py-4">
                <img
                  src={productImageUrl(product.image)}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-sm bg-gray-100"
                />
                <div className="flex-1">
                  <p className="font-light">{product.name}</p>
                  <p className="text-studio-terracotta">
                    {CURRENCY}
                    {product.price}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease quantity">
                      <Minus size={14} />
                    </Button>
                    <span className="w-6 text-center">{qty}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={product.oneOfAKind} onClick={() => setQty(product.id, qty + 1)} aria-label="Increase quantity">
                      <Plus size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={() => remove(product.id)} aria-label="Remove">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lines.length > 0 && (
          <SheetFooter className="flex-col sm:flex-col gap-3 border-t pt-4">
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span className="text-studio-terracotta">
                {CURRENCY}
                {total}
              </span>
            </div>
            <Button className="w-full bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite rounded-sm font-light" onClick={checkout}>
              Send order by email
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
