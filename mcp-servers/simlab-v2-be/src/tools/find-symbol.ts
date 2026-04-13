import { readFile } from "fs/promises";
import type { SymbolIndex, SymbolEntry } from "../indexer/symbol-index.js";

export async function findSymbolTool(
  index: SymbolIndex,
  name: string,
  kind?: string
) {
  if (!name) throw new Error("name is required");
  await index.ensureBuilt();
  let results = index.find(name, kind);

  // Auto-rebuild: jika tidak ketemu, mungkin ada file baru — scan ulang
  if (results.length === 0) {
    const rebuild = await index.rebuild();
    results = index.find(name, kind);
    return {
      query: { name, kind: kind ?? "any" },
      index_size: index.size,
      count: results.length,
      results: results.map(toDto),
      auto_rebuilt: true,
      rebuild_ms: rebuild.ms,
    };
  }

  return {
    query: { name, kind: kind ?? "any" },
    index_size: index.size,
    count: results.length,
    results: results.map(toDto),
  };
}

export async function getSymbolBodyTool(
  index: SymbolIndex,
  name: string,
  maxLines: number
) {
  if (!name) throw new Error("name is required");
  await index.ensureBuilt();
  let results = index.find(name);
  if (results.length === 0) {
    // Auto-rebuild kalau tidak ketemu
    await index.rebuild();
    results = index.find(name);
  }
  if (results.length === 0) {
    return { name, found: false, index_size: index.size };
  }
  const first = results[0];
  const content = await readFile(first.file, "utf-8");
  const lines = content.split("\n");
  const startLine = first.line - 1;
  const endLine = Math.min(lines.length, startLine + maxLines);
  const body = lines.slice(startLine, endLine).join("\n");

  return {
    name,
    file: first.file,
    line: first.line,
    kind: first.kind,
    body_lines: endLine - startLine,
    body,
    truncated: endLine - startLine === maxLines && endLine < lines.length,
    other_matches: results.length - 1,
  };
}

function toDto(s: SymbolEntry) {
  return { name: s.name, kind: s.kind, file: s.file, line: s.line };
}
