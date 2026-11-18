// The product list is generated from shop/products.xlsx by `npm run update-shop`.
// Don't edit products.json by hand - edit the Excel file instead.
import productsData from "./products.json";

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number; // in ILS
  image: string; // file name inside public/products
  oneOfAKind?: boolean; // only one piece exists - can't be ordered more than once
};

export const CURRENCY = "₪";

export const shopProducts: ShopProduct[] = productsData as ShopProduct[];

export const productImageUrl = (image: string) =>
  `${import.meta.env.BASE_URL}products/${image}`;
