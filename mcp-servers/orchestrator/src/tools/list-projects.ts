import { readFile } from "fs/promises";
import { join } from "path";

export async function listProjects(claudeHome: string) {
  const path = join(claudeHome, "project-registry.json");
  const raw = await readFile(path, "utf-8");
  const registry = JSON.parse(raw);

  const projects = Object.entries(registry.projects ?? {}).map(
    ([slug, info]: [string, any]) => ({
      slug,
      name: info.name,
      stack_profile: info.stack_profile,
      stack: info.stack,
      status: info.status,
      group: info.group,
      path: info.path,
    })
  );

  return {
    count: projects.length,
    projects,
    groups: registry.groups,
  };
}
