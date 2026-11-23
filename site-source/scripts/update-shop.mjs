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
  //          G stock quantity (entered by the owner) | H sold so far | I out of stock on site
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
      // column I is set to "yes" only after the owner approved marking it as out of stock
      outOfStock: yes(row.getCell(9).value),
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
  fs.rmSync(path.join(repoRoot, "projects"), { recursive: true, force: true });
  fs.cpSync(dist, repoRoot, { recursive: true });
  // no project photos -> don't leave an empty "projects" folder in the repo root
  const rootProjects = path.join(repoRoot, "projects");
  if (fs.existsSync(rootProjects) && fs.readdirSync(rootProjects).length === 0) fs.rmdirSync(rootProjects);
}

// ---- Projects & Exhibitions (Projects & Exhibitions/projects.xlsx) ----
// Columns: A type (Exhibition/Project/Award) | B title | C year/date | D location | E description
//          F image file (optional) | G link (optional) | H approved by owner (yes/no)
// Only rows with H = yes are published.
const pxDir = path.join(repoRoot, "Projects & Exhibitions");
const pxXlsx = path.join(pxDir, "projects.xlsx");
const pxPhotos = path.join(pxDir, "photos");
const pxPublic = path.join(siteSource, "public", "projects");
const pxData = path.join(siteSource, "src", "data", "projects.json");

async function readProjects() {
  if (!fs.existsSync(pxXlsx)) return [];
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(pxXlsx);
  const ws = wb.worksheets[0];
  const items = [];
  const used = new Set();
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const title = cellText(row.getCell(2).value).replace(/\s+/g, " ");
    if (!title) return;
    if (!yes(row.getCell(8).value)) {
      console.log(`  projects row ${n}: "${title}" is not approved (H) -> not published`);
      return;
    }
    const typeRaw = cellText(row.getCell(1).value).toLowerCase();
    const type = typeRaw.startsWith("exh") ? "Exhibition" : typeRaw.startsWith("aw") ? "Award" : "Project";
    const imageName = cellText(row.getCell(6).value);
    let source = "";
    if (imageName && fs.existsSync(pxPhotos)) {
      const files = fs.readdirSync(pxPhotos);
      const want = imageName.toLowerCase();
      const found =
        files.find((f) => f.toLowerCase() === want) ??
        files.find((f) => path.parse(f).name.toLowerCase() === want && !/\(edited\)/i.test(f));
      if (!found) console.warn(`  projects row ${n}: image not found in Projects & Exhibitions/photos: ${imageName} (published without image)`);
      else {
        const edited = `${path.parse(found).name} (edited).jpg`;
        source = fs.existsSync(path.join(pxPhotos, edited)) ? edited : found;
      }
    }
    let id = slug(title);
    for (let i = 2; used.has(id); i++) id = `${slug(title)}-${i}`;
    used.add(id);
    items.push({
      id,
      type,
      title,
      date: cellText(row.getCell(3).value),
      location: cellText(row.getCell(4).value),
      description: cellText(row.getCell(5).value),
      link: cellText(row.getCell(7).value),
      source,
      image: source ? `${id}.jpg` : "",
    });
  });
  return items;
}

async function prepareProjectImages(items) {
  fs.mkdirSync(pxPublic, { recursive: true });
  for (const p of items) {
    if (!p.source) continue;
    await sharp(path.join(pxPhotos, p.source))
      .rotate()
      .resize({ width: 1000, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(path.join(pxPublic, p.image));
  }
  const keep = new Set(items.map((p) => p.image).filter(Boolean));
  for (const f of fs.readdirSync(pxPublic)) {
    if (!keep.has(f)) fs.rmSync(path.join(pxPublic, f), { force: true });
  }
}

const projectItems = await readProjects();
console.log(`\n${projectItems.length} project/exhibition item(s) will be on the site:`);
projectItems.forEach((p) => console.log(`  - [${p.type}] ${p.title} (${p.date})`));
await prepareProjectImages(projectItems);
fs.writeFileSync(pxData, JSON.stringify(projectItems.map(({ source, ...rest }) => rest), null, 2) + "\n");

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
