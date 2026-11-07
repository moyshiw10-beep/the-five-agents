import { createHash } from "crypto";
import { inflateRawSync } from "zlib";
import { readFile } from "fs/promises";

export const NOVEMBER_2026_SOURCE = {
  filename: "מעקב-יחידות-אולמות-נובמבר2026-מעודכן.xlsx",
  sha256: "c08e5678eb7e8239eec109ddc603bffc22dadc66200131d52636a352d5f7d73c",
} as const;

const UNITS_SHEET = "כל היחידות";
const REQUESTS_SHEET = "שיריונים ובקשות";

export type SlotClass = "free" | "reserved" | "needs_clarification";

export type PlannedSlot = {
  rowNumber: number;
  date: string;
  hall: string;
  startTime: string;
  endTime: string;
  slotClass: SlotClass;
  importKey: string | null;
  contactIncomplete: boolean;
};

export type WorkbookPlan = {
  sha256: string;
  slots: PlannedSlot[];
  counts: { total: number; free: number; reserved: number; needsClarification: number };
  requests: { total: number; matchesBase: number; outsideBase: number };
  halls: string[];
};

function readZipEntry(buffer: Buffer, wanted: string): string {
  let offset = 0;
  while (offset + 30 <= buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break;
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = buffer.toString("utf8", nameStart, nameStart + nameLength);
    const dataStart = nameStart + nameLength + extraLength;
    const data = buffer.subarray(dataStart, dataStart + compressedSize);
    if (name === wanted) {
      const raw = method === 0 ? data : inflateRawSync(data);
      return raw.toString("utf8");
    }
    offset = dataStart + compressedSize;
  }
  throw new Error(`Workbook entry not found: ${wanted}`);
}

function decodeXml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function sheetFiles(workbookXml: string, relsXml: string): Record<string, string> {
  const rels = new Map<string, string>();
  for (const match of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = match[0].match(/\bId="([^"]+)"/);
    const target = match[0].match(/\bTarget="([^"]+)"/);
    if (id && target) rels.set(id[1], target[1].replace(/^\//, ""));
  }
  const files: Record<string, string> = {};
  for (const match of workbookXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    const target = rels.get(match[2]);
    if (!target) throw new Error(`Missing sheet target for ${match[1]}`);
    files[decodeXml(match[1])] = target.startsWith("xl/") ? target : `xl/${target}`;
  }
  return files;
}

function cellText(cellXml: string): string {
  if (cellXml.includes('t="inlineStr"')) {
    return [...cellXml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => decodeXml(match[1])).join("");
  }
  const value = cellXml.match(/<v>([\s\S]*?)<\/v>/);
  return value ? decodeXml(value[1]) : "";
}

function rowsOf(sheetXml: string): string[][] {
  const rows: string[][] = [];
  for (const row of sheetXml.matchAll(/<row r="\d+"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = new Map<number, string>();
    for (const cell of row[1].matchAll(/<c r="([A-Z]+)\d+"[\s\S]*?(?:\/>|<\/c>)/g)) {
      const letters = cell[1];
      let index = 0;
      for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64);
      cells.set(index - 1, cellText(cell[0]));
    }
    if (cells.size === 0) continue;
    const width = Math.max(...cells.keys()) + 1;
    rows.push(Array.from({ length: width }, (_, index) => cells.get(index) ?? ""));
  }
  return rows;
}

function excelDate(serial: number): string {
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 86400000;
  return new Date(utc).toISOString().slice(0, 10);
}

function excelTime(fraction: number): string {
  const minutes = Math.round(fraction * 24 * 60);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function classifyStatus(status: string): SlotClass {
  if (status === "פנוי לפי הנתונים שנמסרו") return "free";
  if (status === "משוריין") return "reserved";
  if (status === "טעון בירור" || status.startsWith("טעון בירור")) return "needs_clarification";
  throw new Error(`Unmapped status, import stopped: ${status}`);
}

export async function readNovember2026Workbook(sourcePath: string): Promise<WorkbookPlan> {
  const bytes = await readFile(sourcePath);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== NOVEMBER_2026_SOURCE.sha256) {
    throw new Error("Workbook sha256 does not match the confirmed November 2026 file. No records read for import.");
  }

  const workbookXml = readZipEntry(bytes, "xl/workbook.xml");
  const relsXml = readZipEntry(bytes, "xl/_rels/workbook.xml.rels");
  const files = sheetFiles(workbookXml, relsXml);
  const unitsXml = readZipEntry(bytes, files[UNITS_SHEET]);
  const requestsXml = readZipEntry(bytes, files[REQUESTS_SHEET]);
  const unitRows = rowsOf(unitsXml).filter((row) => /^\d+$/.test(row[0] ?? ""));
  const requestRows = rowsOf(requestsXml).filter((row) => /^\d+$/.test(row[0] ?? ""));

  const slots: PlannedSlot[] = unitRows.map((row) => {
    const rowNumber = Number(row[0]);
    if (Number(row[6]) !== 90) throw new Error(`Row ${rowNumber} is not a 90-minute unit.`);
    const status = classifyStatus(row[7] ?? "");
    const contact = (row[8] ?? "").trim();
    return {
      rowNumber,
      date: excelDate(Number(row[1])),
      hall: row[3] ?? "",
      startTime: excelTime(Number(row[4])),
      endTime: excelTime(Number(row[5])),
      slotClass: status,
      importKey: status === "reserved" ? `${sha256}:base:${rowNumber}` : null,
      contactIncomplete: contact.includes("להשלמה") || contact.includes("לאימות") || contact.includes("?"),
    };
  });

  const counts = {
    total: slots.length,
    free: slots.filter((slot) => slot.slotClass === "free").length,
    reserved: slots.filter((slot) => slot.slotClass === "reserved").length,
    needsClarification: slots.filter((slot) => slot.slotClass === "needs_clarification").length,
  };
  if (counts.total !== 32 || counts.free !== 29 || counts.reserved !== 1 || counts.needsClarification !== 2) {
    throw new Error(`Unexpected inventory counts: ${JSON.stringify(counts)}`);
  }

  let matchesBase = 0;
  let outsideBase = 0;
  for (const row of requestRows) {
    const kind = row[8] ?? "";
    if (kind.includes("תואם משבצת בסיס")) matchesBase += 1;
    else outsideBase += 1;
  }
  if (requestRows.length !== 6 || matchesBase !== 1 || outsideBase !== 5) {
    throw new Error("Request sheet no longer reconciles to 1 in-base and 5 outside-base rows.");
  }

  const halls = [...new Set(slots.map((slot) => slot.hall))].sort();
  return { sha256, slots, counts, requests: { total: requestRows.length, matchesBase, outsideBase }, halls };
}
