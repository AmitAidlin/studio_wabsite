// Creates "Projects & Exhibitions/projects.xlsx" with draft rows (only if it does not exist yet).
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "..", "..", "Projects & Exhibitions");
const file = path.join(dir, "projects.xlsx");
fs.mkdirSync(path.join(dir, "photos"), { recursive: true });
if (fs.existsSync(file)) {
  console.log("projects.xlsx already exists - not overwritten");
  process.exit(0);
}

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Projects & Exhibitions", { views: [{ state: "frozen", ySplit: 1 }] });
ws.columns = [
  { header: "Type: Exhibition / Project / Award (סוג)", width: 22 },
  { header: "Title (כותרת)", width: 46 },
  { header: "Year / date (שנה)", width: 16 },
  { header: "Location / organizer (מיקום)", width: 36 },
  { header: "Description (תיאור)", width: 80 },
  { header: "Image file - optional (שם קובץ תמונה)", width: 30 },
  { header: "Link - optional (קישור)", width: 30 },
  { header: "APPROVED to publish? yes/no (מאושר להעלאה)", width: 24 },
];
const head = ws.getRow(1);
head.font = { bold: true, color: { argb: "FFFFFFFF" } };
head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC47264" } };
head.alignment = { vertical: "middle", wrapText: true };
head.height = 36;

// Drafts taken from the 2026 CV. Nothing is published until column H is set to "yes".
const rows = [
  ["Exhibition", 'The Israeli Biennale – "Leviathan"', "2023", "Israel", "Participant with the Design-Tech Lab.", "", "", "no"],
  ["Exhibition", "The Israeli Biennale – HIT Ceramic Department exhibition", "2023", "Israel", "Participant with my final project from the Holon Institute of Technology.", "", "", "no"],
  ["Exhibition", "3D Printed exhibition", "2023", "Science Museum, Jerusalem", "Participant with my final project.", "", "", "no"],
  ["Exhibition", "Fresh Paint – Israeli commercial design exhibition", "2023", "Israel", "Participant with a 3D-printed espresso cups set.", "", "", "no"],
  ["Exhibition", "Ceramic exhibition", "2022", "Paris Design Week", "Participant with my final project.", "", "", "no"],
  ["Award", "Package design award", "2020", "The Israeli Institute of Packaging", "Winner of the Israeli Institute of Packaging award for a package design.", "", "", "no"],
  ["Project", "Reef-Plant: ceramic 3D-printed units for coral out-planting", "2026", "Technion – Design-Tech Lab", "Ceramic 3D-printed design and assessment for coral out-planting. Published in Ecological Engineering (Elsevier), volume 232.", "", "", "no"],
  ["Project", "Artificial coral reef through generative design", "2023 – present", "Technion – Israel Institute of Technology", "Doctoral research on the design and development of artificial coral nurseries using generative design methods and clay 3D printing.", "", "", "no"],
  ["Project", "BarBend – parametric, reversible solid wood bending", "2024", "eCAADe 42", "Parametric and reversible solid wood bending through CNC cutting. Co-authored paper presented at eCAADe 42.", "", "", "no"],
];
rows.forEach((r) => ws.addRow(r));
for (let r = 2; r <= 200; r++) {
  ws.getCell(`A${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"Exhibition,Project,Award"'] };
  ws.getCell(`H${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"yes,no"'] };
  ws.getCell(`E${r}`).alignment = { wrapText: true, vertical: "top" };
  ws.getCell(`B${r}`).alignment = { wrapText: true, vertical: "top" };
}

const help = wb.addWorksheet("How to use (הוראות)");
help.getColumn(1).width = 110;
[
  "These rows are DRAFTS written from your CV. Please edit them: fix the texts, dates and places.",
  "Add a photo (optional): put it in the folder  Projects & Exhibitions\\photos  and write its file name in column F.",
  "Nothing is published until you set column H (APPROVED) to yes. Rows with no stay hidden.",
  "Save and close the file, then tell Claude to update the site. Claude will show you the list before publishing.",
  "Then in GitHub Desktop: Commit -> Push.",
  "Don't put private details (ID number, address, phone) in this file - everything in it can appear on the public site.",
].forEach((t) => help.addRow([t]));

await wb.xlsx.writeFile(file);
console.log("Created", file);
