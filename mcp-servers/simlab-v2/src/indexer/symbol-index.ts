import { readdir, readFile } from "fs/promises";
import { join } from "path";

export interface SymbolEntry {
  name: string;
  kind: "function" | "method" | "class";
  file: string;
  line: number;
}

const IGNORED_DIRS = new Set([
  "vendor",
  "node_modules",
  ".git",
  "storage",
  "bootstrap",
  "public",
  "database",
  "tests",
]);

const SCAN_ROOTS = ["app", "routes"];

export class SymbolIndex {
  private symbols: SymbolEntry[] = [];
  private built = false;
  private buildPromise: Promise<void> | null = null;

  constructor(private projectPath: string) {}

  get size(): number {
    return this.symbols.length;
  }

  async ensureBuilt(): Promise<void> {
    if (this.built) return;
    if (this.buildPromise) return this.buildPromise;
    this.buildPromise = this.build();
    await this.buildPromise;
  }

  private async build(): Promise<void> {
    const start = Date.now();
    for (const root of SCAN_ROOTS) {
      const fullPath = join(this.projectPath, root);
      try {
        await this.scanDir(fullPath);
      } catch {
        // skip missing root
      }
    }
    this.built = true;
    console.error(
      `[symbol-index] built ${this.symbols.length} symbols in ${Date.now() - start}ms`
    );
  }

  private async scanDir(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      if (IGNORED_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.scanDir(full);
      } else if (entry.isFile() && entry.name.endsWith(".php")) {
        await this.indexFile(full);
      }
    }
  }

  private async indexFile(file: string): Promise<void> {
    let content: string;
    try {
      content = await readFile(file, "utf-8");
    } catch {
      return;
    }
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const classMatch = line.match(/^\s*(?:abstract\s+|final\s+)?class\s+(\w+)/);
      if (classMatch) {
        this.symbols.push({ name: classMatch[1], kind: "class", file, line: i + 1 });
        continue;
      }
      const fnMatch = line.match(
        /^\s*(?:(?:public|protected|private|static|abstract|final)\s+)*function\s+(\w+)\s*\(/
      );
      if (fnMatch) {
        const isMethod = /^\s*(public|protected|private|static|abstract|final)/.test(
          line
        );
        this.symbols.push({
          name: fnMatch[1],
          kind: isMethod ? "method" : "function",
          file,
          line: i + 1,
        });
      }
    }
  }

  async rebuild(): Promise<{ count: number; ms: number }> {
    this.symbols = [];
    this.built = false;
    this.buildPromise = null;
    const start = Date.now();
    await this.ensureBuilt();
    return { count: this.symbols.length, ms: Date.now() - start };
  }

  find(name: string, kind?: string): SymbolEntry[] {
    const filterKind = kind && kind !== "any" ? kind : null;
    return this.symbols.filter(
      (s) => s.name === name && (!filterKind || s.kind === filterKind)
    );
  }
}
