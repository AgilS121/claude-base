import { readFile, writeFile } from "fs/promises";
import { join } from "path";

interface LogTaskArgs {
  task_id: string;
  action: string;
  files: string[];
  result: string;
}

export async function logTask(docsPath: string, args: LogTaskArgs) {
  const path = join(docsPath, "AUDIT_LOG.md");

  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    content = [
      "# Audit Log",
      "",
      "> Auto-updated oleh agent setelah task selesai.",
      "",
      "| Date | Action | Files Touched | Result |",
      "|---|---|---|---|",
      "",
    ].join("\n");
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const filesStr = args.files.join(", ");

  const entry = `| ${date} | ${args.task_id} ${args.action} | ${filesStr} | ${args.result} |`;

  // Insert before the "## Format Entry" section if it exists, otherwise append
  const formatIdx = content.indexOf("## Format Entry");
  if (formatIdx !== -1) {
    content = content.slice(0, formatIdx).trimEnd() + "\n" + entry + "\n\n" + content.slice(formatIdx);
  } else {
    content = content.trimEnd() + "\n" + entry + "\n";
  }

  await writeFile(path, content, "utf-8");

  return {
    file: path,
    entry,
    message: `Logged: ${args.task_id} — ${args.action}`,
  };
}
