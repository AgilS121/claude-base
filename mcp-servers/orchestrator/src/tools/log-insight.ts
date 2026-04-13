import { readFile, writeFile } from "fs/promises";
import { join } from "path";

interface InsightArgs {
  type: "cross_project_pattern" | "feedback" | "workflow" | "gotcha";
  title: string;
  detail: string;
  projects: string[];
  source?: string;
}

export async function logInsight(claudeHome: string, args: InsightArgs) {
  const path = join(claudeHome, "project-docs", "INSIGHTS.md");

  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    content = [
      "# Cross-Project Insights",
      "",
      "> Pattern, feedback, dan gotcha yang berlaku lintas project.",
      "> Auto-updated oleh orchestrator.",
      "",
    ].join("\n");
  }

  const today = new Date().toISOString().slice(0, 10);
  const projectList = args.projects.join(", ");
  const typeLabel = {
    cross_project_pattern: "Pattern",
    feedback: "Feedback",
    workflow: "Workflow",
    gotcha: "Gotcha",
  }[args.type];

  const entry = [
    `## [${today}] [${typeLabel}] ${args.title}`,
    `- **Projects**: ${projectList}`,
    `- **Detail**: ${args.detail}`,
    args.source ? `- **Source**: ${args.source}` : null,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  content = content.trimEnd() + "\n\n" + entry + "\n";

  await writeFile(path, content, "utf-8");

  return {
    file: path,
    type: args.type,
    title: args.title,
    message: `Insight logged: [${typeLabel}] ${args.title}`,
  };
}
