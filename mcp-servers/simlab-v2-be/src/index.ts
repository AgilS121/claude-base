#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { join } from "path";
import { getClaudeMd } from "./tools/get-claude-md.js";
import { getCurrentState } from "./tools/get-current-state.js";
import { getMistakes } from "./tools/get-mistakes.js";
import { findSymbolTool, getSymbolBodyTool } from "./tools/find-symbol.js";
import { listRoutes } from "./tools/list-routes.js";
import { logTask } from "./tools/log-task.js";
import { updateState } from "./tools/update-state.js";
import { recordMistake } from "./tools/record-mistake.js";
import { SymbolIndex } from "./indexer/symbol-index.js";

const PROJECT_SLUG = process.env.PROJECT_SLUG ?? "simlab-v2-be";
const PROJECT_PATH =
  process.env.PROJECT_PATH ?? "d:\\HSD\\SIMLAB\\old-simlab-v2-be";
const CLAUDE_HOME =
  process.env.CLAUDE_HOME ?? `${process.env.USERPROFILE ?? process.env.HOME}/.claude`;
const DOCS_PATH = join(CLAUDE_HOME, "project-docs", PROJECT_SLUG);

const symbolIndex = new SymbolIndex(PROJECT_PATH);

const server = new Server(
  { name: "simlab-v2-be", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const tools = [
  {
    name: "get_claude_md",
    description: "Ambil isi CLAUDE.md project (dari ~/.claude/project-docs/<slug>/CLAUDE.md) — berisi symbol index & gotchas.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_current_state",
    description: "Ambil CURRENT_STATE.md project — task aktif + yang baru selesai.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_mistakes",
    description: "Ambil MISTAKES.md, bisa filter by topic keyword.",
    inputSchema: {
      type: "object" as const,
      properties: {
        topic: { type: "string", description: "Optional keyword filter (case-insensitive)" },
      },
    },
  },
  {
    name: "find_symbol",
    description:
      "Cari function/method/class di codebase PHP project (scan app/, routes/). Jauh lebih hemat token daripada Grep — return: name, file, line, kind.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Exact name (case-sensitive)" },
        kind: {
          type: "string",
          enum: ["function", "method", "class", "any"],
          description: "Filter by kind, default any",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_symbol_body",
    description:
      "Ambil body fungsi/method (default 80 baris dari definition). Pakai SETELAH find_symbol. Lebih hemat daripada Read tanpa limit.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        max_lines: { type: "number", description: "Max baris yang return, default 80" },
      },
      required: ["name"],
    },
  },
  {
    name: "list_routes",
    description:
      "Parse routes/web.php → return array {method, uri, handler, name, line}. Tidak perlu Read file besar.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "log_task",
    description:
      "Catat task selesai ke AUDIT_LOG.md. Panggil setiap kali selesai fix bug / implement fitur.",
    inputSchema: {
      type: "object" as const,
      properties: {
        task_id: { type: "string", description: "Task ID, e.g. SIMLAB-V2-260413-001" },
        action: { type: "string", description: "Deskripsi singkat apa yang dilakukan" },
        files: {
          type: "array",
          items: { type: "string" },
          description: "File yang diubah",
        },
        result: { type: "string", description: "Hasil: done / partial / failed" },
      },
      required: ["task_id", "action", "files", "result"],
    },
  },
  {
    name: "update_state",
    description:
      "Update CURRENT_STATE.md — tambah task baru, complete task, atau update status task.",
    inputSchema: {
      type: "object" as const,
      properties: {
        action: {
          type: "string",
          enum: ["add_task", "complete_task", "update_task"],
          description: "Aksi: add_task (baru), complete_task (pindah ke selesai), update_task (update status)",
        },
        task_id: { type: "string", description: "Task ID" },
        title: { type: "string", description: "Judul task (untuk add_task)" },
        status: { type: "string", description: "Status baru" },
        scope: { type: "string", description: "Scope: simlab-v2-fe / simlab-v2-be / both" },
        files_changed: {
          type: "array",
          items: { type: "string" },
          description: "File yang diubah",
        },
        notes: { type: "string", description: "Catatan tambahan" },
      },
      required: ["action", "task_id"],
    },
  },
  {
    name: "rebuild_index",
    description:
      "Re-scan semua file PHP di app/ dan routes/ untuk update symbol index. Panggil setelah ada file/module baru ditambahkan.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "record_mistake",
    description:
      "Catat bug/gotcha ke MISTAKES.md. Panggil saat menemukan bug, anti-pattern, atau gotcha baru.",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Judul singkat bug/gotcha" },
        found_during: { type: "string", description: "Kapan ditemukan: trace / debug / review / scan" },
        file: { type: "string", description: "File path + line number" },
        root_cause: { type: "string", description: "Penjelasan root cause" },
        fix: { type: "string", description: "Status fix: sudah fix / belum / workaround" },
        impact: { type: "string", enum: ["low", "medium", "high"], description: "Impact level" },
        related: { type: "string", description: "Cross-reference ke project lain jika ada" },
      },
      required: ["title", "found_during", "file", "root_cause", "fix", "impact"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result: unknown;
    switch (name) {
      case "get_claude_md":
        result = await getClaudeMd(DOCS_PATH);
        break;
      case "get_current_state":
        result = await getCurrentState(DOCS_PATH);
        break;
      case "get_mistakes":
        result = await getMistakes(
          DOCS_PATH,
          args?.topic ? String(args.topic) : undefined
        );
        break;
      case "find_symbol":
        result = await findSymbolTool(
          symbolIndex,
          String(args?.name ?? ""),
          args?.kind ? String(args.kind) : undefined
        );
        break;
      case "get_symbol_body":
        result = await getSymbolBodyTool(
          symbolIndex,
          String(args?.name ?? ""),
          typeof args?.max_lines === "number" ? args.max_lines : 80
        );
        break;
      case "list_routes":
        result = await listRoutes(PROJECT_PATH);
        break;
      case "rebuild_index":
        result = await symbolIndex.rebuild();
        break;
      case "log_task":
        result = await logTask(DOCS_PATH, {
          task_id: String(args?.task_id ?? ""),
          action: String(args?.action ?? ""),
          files: Array.isArray(args?.files) ? args.files.map(String) : [],
          result: String(args?.result ?? "done"),
        });
        break;
      case "update_state":
        result = await updateState(DOCS_PATH, {
          action: String(args?.action ?? "add_task") as "add_task" | "complete_task" | "update_task",
          task_id: String(args?.task_id ?? ""),
          title: args?.title ? String(args.title) : undefined,
          status: args?.status ? String(args.status) : undefined,
          scope: args?.scope ? String(args.scope) : undefined,
          files_changed: Array.isArray(args?.files_changed) ? args.files_changed.map(String) : undefined,
          notes: args?.notes ? String(args.notes) : undefined,
        });
        break;
      case "record_mistake":
        result = await recordMistake(DOCS_PATH, {
          title: String(args?.title ?? ""),
          found_during: String(args?.found_during ?? ""),
          file: String(args?.file ?? ""),
          root_cause: String(args?.root_cause ?? ""),
          fix: String(args?.fix ?? ""),
          impact: (args?.impact as "low" | "medium" | "high") ?? "medium",
          related: args?.related ? String(args.related) : undefined,
        });
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
  `[simlab-v2-be-mcp] connected. project=${PROJECT_SLUG} path=${PROJECT_PATH}`
);
