import { readFile, readdir } from "fs/promises";
import { join } from "path";

interface PatternMatch {
  project: string;
  title: string;
  preview: string;
}

/**
 * Scan MISTAKES.md dari semua project, cari pattern yang muncul
 * di lebih dari 1 project (cross-project pattern detection).
 *
 * Juga bisa search by keyword untuk cek apakah bug tertentu
 * sudah pernah terjadi di project lain.
 */
export async function aggregatePatterns(
  claudeHome: string,
  keyword?: string
) {
  const docsRoot = join(claudeHome, "project-docs");

  let slugs: string[];
  try {
    const entries = await readdir(docsRoot, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return { error: "Cannot read project-docs directory" };
  }

  const allMatches: PatternMatch[] = [];
  const projectMistakes: Record<string, string[]> = {};

  for (const slug of slugs) {
    try {
      const path = join(docsRoot, slug, "MISTAKES.md");
      const content = await readFile(path, "utf-8");
      const sections = content.split(/(?=^##\s)/m).filter((s) => s.trim());

      const titles: string[] = [];
      for (const section of sections) {
        const titleMatch = section.match(/^##\s+\[.*?\]\s*—\s*(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : "";
        titles.push(title);

        // If keyword provided, filter
        if (keyword) {
          const lower = keyword.toLowerCase();
          if (section.toLowerCase().includes(lower)) {
            allMatches.push({
              project: slug,
              title,
              preview: section.slice(0, 500),
            });
          }
        }
      }

      projectMistakes[slug] = titles;
    } catch {
      // skip projects without MISTAKES.md
    }
  }

  // Cross-project pattern detection: find similar titles across projects
  const crossPatterns: Array<{
    pattern: string;
    found_in: string[];
  }> = [];

  if (!keyword) {
    const allTitles = Object.entries(projectMistakes);
    for (let i = 0; i < allTitles.length; i++) {
      for (let j = i + 1; j < allTitles.length; j++) {
        const [slugA, titlesA] = allTitles[i];
        const [slugB, titlesB] = allTitles[j];

        for (const titleA of titlesA) {
          if (!titleA) continue;
          for (const titleB of titlesB) {
            if (!titleB) continue;
            if (fuzzyMatch(titleA, titleB)) {
              crossPatterns.push({
                pattern: titleA,
                found_in: [slugA, slugB],
              });
            }
          }
        }
      }
    }
  }

  return {
    projects_scanned: slugs.length,
    keyword: keyword ?? null,
    matches: keyword ? allMatches : undefined,
    cross_patterns: crossPatterns.length > 0 ? crossPatterns : undefined,
    projects_with_mistakes: Object.keys(projectMistakes),
    summary:
      keyword
        ? `Found ${allMatches.length} matches for "${keyword}" across ${slugs.length} projects`
        : `Scanned ${slugs.length} projects, found ${crossPatterns.length} cross-project patterns`,
  };
}

/**
 * Simple fuzzy match: check if 50%+ of words overlap
 */
function fuzzyMatch(a: string, b: string): boolean {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }

  const minSize = Math.min(wordsA.size, wordsB.size);
  return overlap / minSize >= 0.5;
}
