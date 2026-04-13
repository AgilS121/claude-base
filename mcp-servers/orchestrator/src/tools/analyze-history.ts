import { readFile, readdir } from "fs/promises";
import { join } from "path";

interface AnalysisResult {
  hotspots: Array<{ file: string; touch_count: number; projects: string[] }>;
  repeat_bugs: Array<{ pattern: string; count: number; entries: string[] }>;
  warnings: string[];
  suggestions: string[];
  stats: {
    total_tasks: number;
    total_mistakes: number;
    projects_analyzed: number;
    date_range: { earliest: string; latest: string } | null;
  };
}

export async function analyzeHistory(claudeHome: string): Promise<AnalysisResult> {
  const docsRoot = join(claudeHome, "project-docs");

  let slugs: string[];
  try {
    const entries = await readdir(docsRoot, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return emptyResult("Cannot read project-docs");
  }

  // Collect all audit entries and mistakes
  const allFiles: Map<string, { count: number; projects: Set<string>; tasks: string[] }> = new Map();
  const allMistakes: Array<{ project: string; title: string; file: string; root_cause: string; date: string }> = [];
  const allDates: string[] = [];
  let totalTasks = 0;

  for (const slug of slugs) {
    // Parse AUDIT_LOG
    try {
      const auditPath = join(docsRoot, slug, "AUDIT_LOG.md");
      const auditContent = await readFile(auditPath, "utf-8");
      const auditEntries = parseAuditFiles(auditContent, slug);
      totalTasks += auditEntries.length;

      for (const entry of auditEntries) {
        if (entry.date) allDates.push(entry.date);
        for (const file of entry.files) {
          const normalized = normalizeFile(file);
          if (!normalized) continue;
          if (!allFiles.has(normalized)) {
            allFiles.set(normalized, { count: 0, projects: new Set(), tasks: [] });
          }
          const record = allFiles.get(normalized)!;
          record.count++;
          record.projects.add(slug);
          record.tasks.push(entry.action);
        }
      }
    } catch { /* skip */ }

    // Parse MISTAKES
    try {
      const mistakePath = join(docsRoot, slug, "MISTAKES.md");
      const mistakeContent = await readFile(mistakePath, "utf-8");
      const mistakes = parseMistakes(mistakeContent, slug);
      allMistakes.push(...mistakes);
    } catch { /* skip */ }
  }

  // === ANALYSIS ===

  // 1. Hotspots: files touched 3+ times
  const hotspots = Array.from(allFiles.entries())
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([file, v]) => ({
      file,
      touch_count: v.count,
      projects: Array.from(v.projects),
    }));

  // 2. Repeat bugs: similar root causes
  const causeGroups = groupBySimilarity(
    allMistakes.map((m) => ({
      key: m.root_cause.toLowerCase(),
      label: m.title,
      project: m.project,
      date: m.date,
    }))
  );
  const repeatBugs = causeGroups
    .filter((g) => g.count >= 2)
    .map((g) => ({
      pattern: g.representative,
      count: g.count,
      entries: g.items.map((i) => `[${i.project}] ${i.label} (${i.date})`),
    }));

  // 3. Warnings based on analysis
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Hotspot warnings
  for (const hs of hotspots) {
    if (hs.touch_count >= 5) {
      warnings.push(
        `🔥 ${hs.file} disentuh ${hs.touch_count}x — kemungkinan file terlalu besar atau tanggung jawab terlalu banyak. Pertimbangkan refactor/split.`
      );
    }
  }

  // Repeat bug warnings
  for (const rb of repeatBugs) {
    warnings.push(
      `🔁 Bug pattern "${rb.pattern}" muncul ${rb.count}x — ada masalah sistemik yang perlu di-address, bukan cuma fix per-case.`
    );
  }

  // Common mistake patterns
  const readFirstBugs = allMistakes.filter(
    (m) => m.root_cause.toLowerCase().includes("read-first") ||
           m.root_cause.toLowerCase().includes("myisam") ||
           m.root_cause.toLowerCase().includes("transaction")
  );
  if (readFirstBugs.length >= 2) {
    warnings.push(
      `⚠️ ${readFirstBugs.length} bugs terkait read-first/MyISAM/transaction — pertimbangkan auto-check sebelum save.`
    );
  }

  // Suggestions based on data
  if (totalTasks > 0 && allMistakes.length === 0) {
    suggestions.push("Belum ada MISTAKES.md tercatat — mulai catat bug yang ditemukan supaya pattern bisa terdeteksi.");
  }

  if (hotspots.length > 0) {
    suggestions.push(
      `Top hotspot: ${hotspots[0].file} (${hotspots[0].touch_count}x). Setiap kali mau sentuh file ini, cek MISTAKES.md dulu — kemungkinan ada known gotcha.`
    );
  }

  if (totalTasks >= 10 && repeatBugs.length === 0) {
    suggestions.push("Tidak ada repeat bug terdeteksi dari history — good sign, pattern sudah cukup bersih.");
  }

  // Cross-project file overlap
  const crossProjectFiles = Array.from(allFiles.entries())
    .filter(([, v]) => v.projects.size > 1);
  if (crossProjectFiles.length > 0) {
    suggestions.push(
      `${crossProjectFiles.length} file disentuh di multiple projects — perubahan di sini bisa impact project lain.`
    );
  }

  // Date range
  allDates.sort();
  const dateRange = allDates.length > 0
    ? { earliest: allDates[0], latest: allDates[allDates.length - 1] }
    : null;

  return {
    hotspots,
    repeat_bugs: repeatBugs,
    warnings,
    suggestions,
    stats: {
      total_tasks: totalTasks,
      total_mistakes: allMistakes.length,
      projects_analyzed: slugs.length,
      date_range: dateRange,
    },
  };
}

// === PARSERS ===

interface AuditEntry {
  date: string;
  action: string;
  files: string[];
}

function parseAuditFiles(content: string, _slug: string): AuditEntry[] {
  const entries: AuditEntry[] = [];
  for (const line of content.split("\n")) {
    if (!line.startsWith("|")) continue;
    if (line.includes("---") || /\|\s*Date\s*\|/i.test(line)) continue;

    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 3 || !/^\d{4}-\d{2}-\d{2}/.test(cols[0])) continue;

    entries.push({
      date: cols[0],
      action: cols[1],
      files: cols[2].split(",").map((f) => f.trim()).filter(Boolean),
    });
  }
  return entries;
}

function parseMistakes(
  content: string,
  project: string
): Array<{ project: string; title: string; file: string; root_cause: string; date: string }> {
  const sections = content.split(/(?=^##\s)/m).filter((s) => s.trim());
  const results: Array<{ project: string; title: string; file: string; root_cause: string; date: string }> = [];

  for (const section of sections) {
    const titleMatch = section.match(/^##\s+\[(\d{4}-\d{2}-\d{2})\]\s*—\s*(.+)$/m);
    if (!titleMatch) continue;

    const fileMatch = section.match(/\*\*File\*\*:\s*(.+)/);
    const causeMatch = section.match(/\*\*Root cause\*\*:\s*(.+)/);

    results.push({
      project,
      date: titleMatch[1],
      title: titleMatch[2].trim(),
      file: fileMatch ? fileMatch[1].trim() : "",
      root_cause: causeMatch ? causeMatch[1].trim() : "",
    });
  }
  return results;
}

function normalizeFile(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—" || trimmed.length < 3) return null;
  // Remove line numbers, clean up
  return trimmed.replace(/:\d+$/, "").replace(/\s*\(.*\)$/, "").trim();
}

// === SIMILARITY GROUPING ===

interface GroupItem {
  key: string;
  label: string;
  project: string;
  date: string;
}

function groupBySimilarity(items: GroupItem[]): Array<{
  representative: string;
  count: number;
  items: GroupItem[];
}> {
  const groups: Array<{ representative: string; count: number; items: GroupItem[] }> = [];

  for (const item of items) {
    let matched = false;
    for (const group of groups) {
      if (fuzzyMatch(item.key, group.items[0].key)) {
        group.items.push(item);
        group.count++;
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups.push({ representative: item.label, count: 1, items: [item] });
    }
  }

  return groups.sort((a, b) => b.count - a.count);
}

function fuzzyMatch(a: string, b: string): boolean {
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.min(wordsA.size, wordsB.size) >= 0.5;
}

function emptyResult(note: string): AnalysisResult {
  return {
    hotspots: [],
    repeat_bugs: [],
    warnings: [note],
    suggestions: [],
    stats: { total_tasks: 0, total_mistakes: 0, projects_analyzed: 0, date_range: null },
  };
}
