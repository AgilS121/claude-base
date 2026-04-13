import { readFile } from "fs/promises";
import { join } from "path";

export async function getProjectStatus(claudeHome: string, slug: string) {
  if (!slug) throw new Error("slug is required");
  const path = join(claudeHome, "project-docs", slug, "CURRENT_STATE.md");
  const content = await readFile(path, "utf-8");

  const activeSection = extractSection(content, "Task Aktif");
  const completedSection = extractSection(content, "Terakhir Selesai");
  const blockersSection = extractSection(content, "Blockers");

  return {
    slug,
    file: path,
    active_task: activeSection ? parseFirstTask(activeSection) : null,
    recent_completed_preview: completedSection ? completedSection.slice(0, 1500) : null,
    blockers: blockersSection ? blockersSection.slice(0, 500) : null,
  };
}

function extractSection(content: string, heading: string): string | null {
  const regex = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`);
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function parseFirstTask(section: string) {
  const taskMatch = section.match(/###\s+(\S+)\s+(.*?)$/m);
  if (!taskMatch) {
    const trimmed = section.slice(0, 600);
    return { raw_preview: trimmed, empty: /\(kosong\)/i.test(trimmed) };
  }
  return {
    id: taskMatch[1],
    title: taskMatch[2],
    preview: section.slice(0, 800),
  };
}
