import { readFile, writeFile } from "fs/promises";
import { join } from "path";

interface RecordMistakeArgs {
  title: string;
  found_during: string;
  file: string;
  root_cause: string;
  fix: string;
  impact: "low" | "medium" | "high";
  related?: string;
}

export async function recordMistake(docsPath: string, args: RecordMistakeArgs) {
  const path = join(docsPath, "MISTAKES.md");

  let content: string;
  try {
    content = await readFile(path, "utf-8");
  } catch {
    content = [
      "# Known Mistakes & Gotchas",
      "",
      "> Auto-updated oleh agent saat menemukan bug/gotcha.",
      "",
    ].join("\n");
  }

  const today = new Date().toISOString().slice(0, 10);

  const entry = [
    `## [${today}] — ${args.title}`,
    `- **Ditemukan saat**: ${args.found_during}`,
    `- **File**: ${args.file}`,
    `- **Root cause**: ${args.root_cause}`,
    `- **Fix**: ${args.fix}`,
    `- **Impact**: ${args.impact}`,
    args.related ? `- **Related**: ${args.related}` : null,
    "",
  ].filter(Boolean).join("\n");

  content = content.trimEnd() + "\n\n" + entry + "\n";

  await writeFile(path, content, "utf-8");

  return {
    file: path,
    title: args.title,
    message: `Recorded mistake: ${args.title}`,
  };
}
