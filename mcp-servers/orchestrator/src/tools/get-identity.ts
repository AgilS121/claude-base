import { readFile } from "fs/promises";
import { join } from "path";

export async function getIdentity(claudeHome: string) {
  const path = join(claudeHome, "agent-identity.json");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}
