#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getIdentity } from "./tools/get-identity.js";
import { getCurrentFocus } from "./tools/get-focus.js";
import { listProjects } from "./tools/list-projects.js";
import { getProjectStatus } from "./tools/get-project-status.js";
import { listRecentTasks } from "./tools/list-recent-tasks.js";
import { switchFocus } from "./tools/switch-focus.js";
import { logInsight } from "./tools/log-insight.js";
import { checkEnergy } from "./tools/check-energy.js";
import { aggregatePatterns } from "./tools/aggregate-patterns.js";
import { analyzeHistory } from "./tools/analyze-history.js";

const CLAUDE_HOME =
  process.env.CLAUDE_HOME ?? `${process.env.USERPROFILE ?? process.env.HOME}/.claude`;

const server = new Server(
  { name: "orchestrator", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const tools = [
  {
    name: "get_identity",
    description:
      "Dapatkan identitas agent (nama, author, spesialisasi). Baca agent-identity.json.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_current_focus",
    description:
      "Dapatkan focus profile aktif + project yang sedang jadi prioritas kerja. Baca current-focus.json.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "list_projects",
    description:
      "List semua project terdaftar di project-registry.json dengan metadata singkat (stack, status, group).",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_project_status",
    description:
      "Baca CURRENT_STATE.md project tertentu, return task aktif + yang baru selesai.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Project slug, misal 'simlab-v2-fe'" },
      },
      required: ["slug"],
    },
  },
  {
    name: "list_recent_tasks",
    description:
      "Parse AUDIT_LOG.md (satu project atau semua) → return task terbaru diurutkan desc. Lebih hemat daripada Read file manual.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: "Optional: project slug tertentu. Kosong = gabungan semua project.",
        },
        limit: { type: "number", description: "Jumlah entry, default 10" },
      },
    },
  },
  {
    name: "switch_focus",
    description:
      "Ganti focus profile aktif (simlab-v2, ppic, general, dll). Update current-focus.json.",
    inputSchema: {
      type: "object" as const,
      properties: {
        profile: {
          type: "string",
          description: "Profile key: simlab-v2, ppic, simlab-tuv-v1, simlab-enviro-tuv-v1, general",
        },
      },
      required: ["profile"],
    },
  },
  {
    name: "log_insight",
    description:
      "Catat insight lintas project (pattern, feedback, gotcha, workflow). Simpan ke INSIGHTS.md global.",
    inputSchema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["cross_project_pattern", "feedback", "workflow", "gotcha"],
          description: "Tipe insight",
        },
        title: { type: "string", description: "Judul singkat" },
        detail: { type: "string", description: "Penjelasan detail" },
        projects: {
          type: "array",
          items: { type: "string" },
          description: "Project yang terlibat",
        },
        source: { type: "string", description: "Sumber: user feedback, bug trace, review, dll" },
      },
      required: ["type", "title", "detail", "projects"],
    },
  },
  {
    name: "check_energy",
    description:
      "Cek apakah sekarang di luar jam kerja developer (Senin-Jumat 08:00-17:00 WIB). Jika ya, return warning. WAJIB panggil di awal sesi.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "aggregate_patterns",
    description:
      "Scan MISTAKES.md dari semua project, deteksi cross-project pattern. Bisa filter by keyword untuk cek apakah bug sudah pernah terjadi di project lain.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword: {
          type: "string",
          description: "Optional: keyword untuk search across semua MISTAKES.md",
        },
      },
    },
  },
  {
    name: "analyze_history",
    description:
      "Otak MCP: analisis AUDIT_LOG + MISTAKES semua project → return hotspot files, repeat bugs, warnings, dan suggestions. Panggil di awal sesi atau sebelum mulai task untuk dapat konteks sejarah.",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result: unknown;
    switch (name) {
      case "get_identity":
        result = await getIdentity(CLAUDE_HOME);
        break;
      case "get_current_focus":
        result = await getCurrentFocus(CLAUDE_HOME);
        break;
      case "list_projects":
        result = await listProjects(CLAUDE_HOME);
        break;
      case "get_project_status":
        result = await getProjectStatus(CLAUDE_HOME, String(args?.slug ?? ""));
        break;
      case "list_recent_tasks":
        result = await listRecentTasks(
          CLAUDE_HOME,
          args?.slug ? String(args.slug) : undefined,
          typeof args?.limit === "number" ? args.limit : 10
        );
        break;
      case "switch_focus":
        result = await switchFocus(CLAUDE_HOME, String(args?.profile ?? ""));
        break;
      case "log_insight":
        result = await logInsight(CLAUDE_HOME, {
          type: String(args?.type ?? "feedback") as "cross_project_pattern" | "feedback" | "workflow" | "gotcha",
          title: String(args?.title ?? ""),
          detail: String(args?.detail ?? ""),
          projects: Array.isArray(args?.projects) ? args.projects.map(String) : [],
          source: args?.source ? String(args.source) : undefined,
        });
        break;
      case "check_energy":
        result = checkEnergy();
        break;
      case "aggregate_patterns":
        result = await aggregatePatterns(
          CLAUDE_HOME,
          args?.keyword ? String(args.keyword) : undefined
        );
        break;
      case "analyze_history":
        result = await analyzeHistory(CLAUDE_HOME);
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
console.error(`[orchestrator-mcp] connected. CLAUDE_HOME=${CLAUDE_HOME}`);
