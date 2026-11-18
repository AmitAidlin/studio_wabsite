// Creates shop/products.xlsx (only if it does not exist yet).
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const shop = path.join(repoRoot, "shop");
const file = path.join(shop, "products.xlsx");
fs.mkdirSync(path.join(shop, "photos"), { recursive: true });
if (fs.existsSync(file)) {
  console.log("products.xlsx already exists - not overwritten");
  process.exit(0);
}

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Products", { views: [{ state: "frozen", ySplit: 1 }] });
ws.columns = [
  { header: "Image file (שם קובץ תמונה)", key: "image", width: 30 },
  { header: "Name (שם המוצר)", key: "name", width: 38 },
  { header: "Description (תיאור)", key: "desc", width: 70 },
  { header: "Price ₪ (מחיר)", key: "price", width: 14 },
  { header: "One of a kind? yes/no (יחיד מסוגו)", key: "unique", width: 22 },
  { header: "Show on site? yes/no (להציג באתר)", key: "show", width: 22 },
];
const head = ws.getRow(1);
head.font = { bold: true, color: { argb: "FFFFFFFF" } };
head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC47264" } };
head.alignment = { vertical: "middle", wrapText: true };
head.height = 34;

ws.addRow({
  image: "espresso cup blue.png",
  name: "Pair of Espresso Cups – Teal Green",
  desc: "A pair of 3D-printed ceramic espresso cups in a bluish-green glaze, with a twisted rope texture and a dark raw-clay rim. Printed layer by layer and finished by hand. One of a kind.",
  price: 125,
  unique: "yes",
  show: "yes",
});

for (let r = 2; r <= 200; r++) {
  ws.getCell(`E${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"yes,no"'] };
  ws.getCell(`F${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"yes,no"'] };
  ws.getCell(`C${r}`).alignment = { wrapText: true, vertical: "top" };
}

const help = wb.addWorksheet("How to use (הוראות)");
help.getColumn(1).width = 110;
[
  "1. Put the product photo in the folder  shop\\photos  and write its exact file name in column A.",
  "2. Fill in the name, description and price. One row = one product.",
  "3. One of a kind = yes  -> the product can be added to the cart only once.",
  "4. To remove a product from the site: set 'Show on site' to no (or delete the row).",
  "5. Save the file, close Excel, and tell Claude to update the site (or run: npm run update-shop in site-source).",
  "6. Then in GitHub Desktop: Commit -> Push.",
].forEach((t) => help.addRow([t]));

await wb.xlsx.writeFile(file);
console.log("Created", file);
