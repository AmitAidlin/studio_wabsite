// Product catalog. To add a product: add an image to site-source/public/products/
// and add a new object to this list.
export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number; // in ILS
  image: string; // file name inside public/products
  oneOfAKind?: boolean; // only one piece exists - can't be ordered more than once
};

export const CURRENCY = "₪";

export const shopProducts: ShopProduct[] = [
  {
    id: "espresso-cup-blue",
    name: "Pair of Espresso Cups – Teal Green",
    description:
      "A pair of 3D-printed ceramic espresso cups in a bluish-green glaze, with a twisted rope texture and a dark raw-clay rim. Printed layer by layer and finished by hand. One of a kind.",
    price: 125,
    image: "espresso-cup-blue.jpg",
    oneOfAKind: true,
  },
];

export const productImageUrl = (image: string) =>
  `${import.meta.env.BASE_URL}products/${image}`;
