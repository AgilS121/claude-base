import { readFile, readdir } from "fs/promises";
import { join } from "path";

interface AuditEntry {
  project: string;
  date: string;
  action: string;
  files: string;
  tokens: string;
  result: string;
}

export async function listRecentTasks(
  claudeHome: string,
  slug: string | undefined,
  limit: number
) {
  const docsRoot = join(claudeHome, "project-docs");
  let slugs: string[];

  if (slug) {
    slugs = [slug];
  } else {
    const entries = await readdir(docsRoot, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }

  const allEntries: AuditEntry[] = [];
  for (const s of slugs) {
    try {
      const path = join(docsRoot, s, "AUDIT_LOG.md");
      const content = await readFile(path, "utf-8");
      allEntries.push(...parseAuditLog(content, s));
    } catch {
      // skip missing files
    }
  }

  allEntries.sort((a, b) => b.date.localeCompare(a.date));

  return {
    query: { slug: slug ?? "all", limit },
    total_found: allEntries.length,
    entries: allEntries.slice(0, limit),
  };
}

function parseAuditLog(content: string, slug: string): AuditEntry[] {
  const entries: AuditEntry[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (line.includes("---")) continue;
    if (/\|\s*Date\s*\|/i.test(line)) continue;
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, arr) => !(i === 0 && c === "") && !(i === arr.length - 1 && c === ""));
    if (cols.length < 2) continue;
    if (!/^\d{4}-\d{2}-\d{2}/.test(cols[0])) continue;
    entries.push({
      project: slug,
      date: cols[0] ?? "",
      action: cols[1] ?? "",
      files: cols[2] ?? "",
      tokens: cols[3] ?? "",
      result: cols[4] ?? "",
    });
  }
  return entries;
}
