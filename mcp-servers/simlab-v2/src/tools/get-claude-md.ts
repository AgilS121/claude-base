import { readFile } from "fs/promises";
import { join } from "path";

export async function getClaudeMd(docsPath: string) {
  const path = join(docsPath, "CLAUDE.md");
  const content = await readFile(path, "utf-8");
  return { file: path, length: content.length, content };
}
