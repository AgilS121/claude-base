import { readFile } from "fs/promises";
import { join } from "path";

export async function getCurrentFocus(claudeHome: string) {
  const path = join(claudeHome, "current-focus.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}
