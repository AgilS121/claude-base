import { readFile } from "fs/promises";
import { join } from "path";

interface RouteEntry {
  method: string;
  uri: string;
  handler: string;
  name: string | null;
  line: number;
}

export async function listRoutes(projectPath: string) {
  const path = join(projectPath, "routes", "web.php");
  const content = await readFile(path, "utf-8");
  const lines = content.split("\n");
  const routes: RouteEntry[] = [];

  const routeRegex =
    /Route::(get|post|put|patch|delete|any|match)\s*\(\s*['"]([^'"]+)['"]\s*,\s*(?:\[([^\]]+)\]|['"]([^'"]+)['"])/;
  const nameRegex = /->name\(\s*['"]([^'"]+)['"]\s*\)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(routeRegex);
    if (!m) continue;
    const nameMatch = line.match(nameRegex);
    routes.push({
      method: m[1].toUpperCase(),
      uri: m[2],
      handler: (m[3] || m[4] || "").trim(),
      name: nameMatch ? nameMatch[1] : null,
      line: i + 1,
    });
  }

  return { file: path, count: routes.length, routes };
}
