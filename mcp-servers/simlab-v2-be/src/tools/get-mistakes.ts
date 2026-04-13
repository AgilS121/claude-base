import { readFile } from "fs/promises";
import { join } from "path";

export async function getMistakes(docsPath: string, topic?: string) {
  const path = join(docsPath, "MISTAKES.md");
  try {
    const content = await readFile(path, "utf-8");
    if (!topic) {
      return {
        file: path,
        length: content.length,
        preview: content.slice(0, 3000),
        truncated: content.length > 3000,
      };
    }
    const sections = content.split(/(?=^##\s)/m);
    const lower = topic.toLowerCase();
    const matches = sections.filter((s) => s.toLowerCase().includes(lower));
    return {
      file: path,
      topic,
      match_count: matches.length,
      matches: matches.map((s) => s.slice(0, 1200)),
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { file: path, content: null, note: "MISTAKES.md belum ada" };
    }
    throw err;
  }
}
