import { readFile, writeFile } from "fs/promises";
import { join } from "path";

interface UpdateStateArgs {
  action: "add_task" | "complete_task" | "update_task";
  task_id: string;
  title?: string;
  status?: string;
  scope?: string;
  files_changed?: string[];
  notes?: string;
}

export async function updateState(docsPath: string, args: UpdateStateArgs) {
  const path = join(docsPath, "CURRENT_STATE.md");

  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    content = [
      "# Current State",
      `Last Updated: ${new Date().toISOString().slice(0, 10)}`,
      "",
      "## Task Aktif",
      "",
      "(tidak ada)",
      "",
      "## Terakhir Selesai",
      "",
      "(belum ada)",
      "",
      "## Blockers",
      "",
      "(tidak ada)",
      "",
    ].join("\n");
  }

  const today = new Date().toISOString().slice(0, 10);

  // Update "Last Updated" line
  content = content.replace(/Last Updated:.*/, `Last Updated: ${today}`);

  switch (args.action) {
    case "add_task": {
      const taskBlock = buildTaskBlock(args);
      // Replace "(tidak ada)" in Task Aktif, or append after header
      const activeHeader = "## Task Aktif";
      const activeIdx = content.indexOf(activeHeader);
      if (activeIdx !== -1) {
        const afterHeader = activeIdx + activeHeader.length;
        const nextSection = content.indexOf("\n## ", afterHeader + 1);
        const sectionContent = nextSection !== -1
          ? content.slice(afterHeader, nextSection)
          : content.slice(afterHeader);

        const cleaned = sectionContent.replace(/\n\(tidak ada\)\n?/, "\n");
        const replacement = cleaned.trimEnd() + "\n\n" + taskBlock + "\n";

        content = nextSection !== -1
          ? content.slice(0, afterHeader) + replacement + "\n" + content.slice(nextSection)
          : content.slice(0, afterHeader) + replacement;
      }
      break;
    }

    case "complete_task": {
      // Find task block in "Task Aktif" and move to "Terakhir Selesai"
      const taskPattern = new RegExp(
        `### ${escapeRegex(args.task_id)}[^]*?(?=\\n### |\\n## |$)`,
        "m"
      );
      const match = content.match(taskPattern);

      if (match) {
        // Remove from Task Aktif
        content = content.replace(match[0], "").replace(/\n{3,}/g, "\n\n");

        // Build completed entry
        const completedEntry = [
          `### ${args.task_id}${args.title ? " " + args.title : ""}`,
          `- **Status**: done`,
          `- **Selesai**: ${today}`,
          args.notes ? `- **Notes**: ${args.notes}` : null,
        ].filter(Boolean).join("\n");

        // Insert at top of "Terakhir Selesai"
        const completedHeader = "## Terakhir Selesai";
        const compIdx = content.indexOf(completedHeader);
        if (compIdx !== -1) {
          const afterComp = compIdx + completedHeader.length;
          const cleaned = content.slice(afterComp).replace(/^\n\(belum ada\)\n?/, "\n");
          content = content.slice(0, afterComp) + "\n\n" + completedEntry + cleaned;
        }
      } else {
        // Task not found in active — just add to completed
        const completedEntry = [
          `### ${args.task_id}${args.title ? " " + args.title : ""}`,
          `- **Status**: done`,
          `- **Selesai**: ${today}`,
          args.notes ? `- **Notes**: ${args.notes}` : null,
        ].filter(Boolean).join("\n");

        const completedHeader = "## Terakhir Selesai";
        const compIdx = content.indexOf(completedHeader);
        if (compIdx !== -1) {
          const afterComp = compIdx + completedHeader.length;
          content = content.slice(0, afterComp) + "\n\n" + completedEntry + content.slice(afterComp);
        }
      }
      break;
    }

    case "update_task": {
      const taskPattern = new RegExp(
        `(### ${escapeRegex(args.task_id)}[^\n]*)(\n[^]*?)(?=\n### |\n## |$)`,
        "m"
      );
      const match = content.match(taskPattern);
      if (match) {
        let taskBody = match[2];
        if (args.status) {
          taskBody = taskBody.replace(
            /- \*\*Status\*\*:.*/,
            `- **Status**: ${args.status}`
          );
        }
        if (args.notes) {
          taskBody = taskBody.trimEnd() + `\n- **Update ${today}**: ${args.notes}\n`;
        }
        content = content.replace(match[0], match[1] + taskBody);
      }
      break;
    }
  }

  await writeFile(path, content, "utf-8");

  return {
    file: path,
    action: args.action,
    task_id: args.task_id,
    message: `State updated: ${args.action} ${args.task_id}`,
  };
}

function buildTaskBlock(args: UpdateStateArgs): string {
  const lines = [
    `### ${args.task_id}${args.title ? " " + args.title : ""}`,
    `- **Status**: ${args.status ?? "in progress"}`,
  ];
  if (args.scope) lines.push(`- **Scope**: ${args.scope}`);
  if (args.files_changed?.length) {
    lines.push(`- **Files**: ${args.files_changed.join(", ")}`);
  }
  if (args.notes) lines.push(`- **Notes**: ${args.notes}`);
  return lines.join("\n");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
