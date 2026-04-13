import { readFile } from "fs/promises";
import { join } from "path";

export async function getCurrentState(docsPath: string) {
  const path = join(docsPath, "CURRENT_STATE.md");
  const content = await readFile(path, "utf-8");

  const active = extractSection(content, "Task Aktif");
  const completed = extractSection(content, "Terakhir Selesai");
  const blockers = extractSection(content, "Blockers");

  return {
    file: path,
    active_task: active,
    recent_completed: completed ? completed.slice(0, 2000) : null,
    blockers,
  };
}

function extractSection(content: string, heading: string): string | null {
  const regex = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`);
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}
