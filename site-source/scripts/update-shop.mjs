// Reads shop/products.xlsx, prepares the product images, rebuilds the site
// and copies the result to the repo root (the folder GitHub Pages serves).
//
// Usage (from site-source):  npm run update-shop
//
import ExcelJS from "exceljs";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteSource = path.resolve(here, "..");
const repoRoot = path.resolve(siteSource, "..");
const xlsxPath = path.join(repoRoot, "shop", "products.xlsx");
const photosDir = path.join(repoRoot, "shop", "photos");
const publicProducts = path.join(siteSource, "public", "products");
const dataFile = path.join(siteSource, "src", "data", "products.json");

const cellText = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return String(v.text ?? v.result ?? "").trim();
  return String(v).trim();
};
const yes = (v) => /^(yes|y|כן|1|true)$/i.test(cellText(v));
const no = (v) => /^(no|n|לא|0|false)$/i.test(cellText(v));
const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";

async function readProducts() {
  if (!fs.existsSync(xlsxPath)) throw new Error(`Missing ${xlsxPath}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath);
  const ws = wb.worksheets[0];

  // Columns: A image file | B name | C description | D price | E one of a kind | F show on site
  const products = [];
  const used = new Set();
  ws.eachRow((row, n) => {
    if (n === 1) return; // header
    const name = cellText(row.getCell(2).value).replace(/\s+/g, " ");
    const image = cellText(row.getCell(1).value);
    if (!name && !image) return; // empty row
    if (no(row.getCell(6).value)) {
      console.log(`  row ${n}: "${name}" is set to Show = no -> not on the site`);
      return;
    }
    const price = Number(cellText(row.getCell(4).value).replace(/[^\d.]/g, ""));
    const problems = [];
    if (!name) problems.push("missing name");
    if (!image) problems.push("missing image file name");
    if (!(price > 0)) problems.push("missing/invalid price");
    // the file name may be written with or without the extension, in any letter case
    const files = fs.readdirSync(photosDir);
    const want = image.toLowerCase();
    const found =
      files.find((f) => f.toLowerCase() === want) ??
      files.find((f) => path.parse(f).name.toLowerCase() === want && !/\(edited\)/i.test(f));
    if (image && !found) problems.push(`image not found in shop/photos: ${image}`);
    // an edited version "<name> (edited).jpg" next to the original is used automatically
    const editedName = found ? `${path.parse(found).name} (edited).jpg` : "";
    const useImage = found && fs.existsSync(path.join(photosDir, editedName)) ? editedName : found;
    if (problems.length) {
      console.warn(`  row ${n}: SKIPPED (${problems.join(", ")})`);
      return;
    }
    let id = slug(name);
    for (let i = 2; used.has(id); i++) id = `${slug(name)}-${i}`;
    used.add(id);
    products.push({
      id,
      name,
      description: cellText(row.getCell(3).value),
      price,
      source: useImage,
      image: `${id}.jpg`,
      oneOfAKind: yes(row.getCell(5).value),
    });
  });
  return products;
}

async function prepareImages(products) {
  fs.mkdirSync(publicProducts, { recursive: true });
  for (const p of products) {
    const out = path.join(publicProducts, p.image);
    await sharp(path.join(photosDir, p.source))
      .rotate()
      .resize({ width: 1000, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(out);
  }
  // remove images of products that are no longer listed
  const keep = new Set(products.map((p) => p.image));
  for (const f of fs.readdirSync(publicProducts)) {
    if (!keep.has(f)) fs.rmSync(path.join(publicProducts, f), { force: true });
  }
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}

function deploy() {
  const dist = path.join(siteSource, "dist");
  // clear previous build output in the repo root (never touches photos or other folders)
  const rootAssets = path.join(repoRoot, "assets");
  if (fs.existsSync(rootAssets)) {
    for (const f of fs.readdirSync(rootAssets, { withFileTypes: true })) {
      if (f.isFile()) fs.rmSync(path.join(rootAssets, f.name), { force: true });
    }
  }
  fs.rmSync(path.join(repoRoot, "products"), { recursive: true, force: true });
  fs.cpSync(dist, repoRoot, { recursive: true });
}

const products = await readProducts();
console.log(`\n${products.length} product(s) will be on the site:`);
products.forEach((p) => console.log(`  - ${p.name}  ₪${p.price}${p.oneOfAKind ? "  (one of a kind)" : ""}`));

await prepareImages(products);
fs.writeFileSync(
  dataFile,
  JSON.stringify(products.map(({ source, ...rest }) => rest), null, 2) + "\n"
);

console.log("\nBuilding the site...");
run(process.execPath, [path.join(siteSource, "node_modules", "vite", "bin", "vite.js"), "build"], siteSource);
deploy();
console.log("\nDone. Now open GitHub Desktop -> Commit -> Push.");
