# How to Build MCP Server

> **NOTE**: Ini panduan high-level. Implementation detail akan di-update setelah
> source MCP orchestrator & project-indexer di-extract dari setup working.

## Kapan Perlu

- Stack baru butuh adapter di `project-indexer`
- Mau tambah tool MCP untuk use case spesifik
- Fork orchestrator untuk fitur baru

## Prerequisites

- Node.js 20+
- TypeScript knowledge
- Familiar dengan MCP spec: https://modelcontextprotocol.io/

## Arsitektur Dasar

MCP server adalah **proses terpisah** yang komunikasi dengan Claude Code via stdio
(JSON-RPC). Claude Code spawn server saat session start, dan server expose "tools"
yang bisa dipanggil Claude.

```
Claude Code ←──stdio──→ MCP Server
                          │
                          └──► file system / API / index / dll
```

## Minimum Implementation

```typescript
// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-mcp",
  version: "1.0.0",
});

// Register tool
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "my_tool",
      description: "Does something",
      inputSchema: {
        type: "object",
        properties: {
          arg1: { type: "string" },
        },
      },
    },
  ],
}));

server.setRequestHandler("tools/call", async (req) => {
  if (req.params.name === "my_tool") {
    return {
      content: [{ type: "text", text: "result" }],
    };
  }
  throw new Error("Unknown tool");
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Build

```bash
npm init -y
npm i @modelcontextprotocol/sdk
npm i -D typescript esbuild @types/node
npx tsc --init

# Bundle
npx esbuild src/server.ts --bundle --platform=node --outfile=dist/server.js
```

## Register ke Claude Code

```bash
claude mcp add my-mcp node /absolute/path/to/dist/server.js
```

Verify:
```bash
claude mcp list
```

## Testing

1. **Manual test** dengan stdio:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/server.js
   ```

2. **Integration test** dengan Claude Code:
   - Buka session
   - Panggil tool: "panggil my_tool dengan arg1='hello'"
   - Verifikasi response

## Design Principles

1. **Stateless preferred** — MCP bisa di-restart kapan saja, jangan simpan state in-memory
   yang susah recover
2. **Fast responses** — tool call <1s idealnya, biar UX Claude tetap snappy
3. **Error messages yang useful** — "file not found: /path/to/x" lebih baik dari "ENOENT"
4. **Input validation** — jangan trust input dari Claude blindly, validate schema
5. **Resource cleanup** — tutup file handle, koneksi DB saat shutdown

## Anti-pattern

- ❌ Shell injection: `exec(\`grep \${userInput}\`)` — jangan pernah
- ❌ Unbounded file read: baca file 100MB langsung ke memory
- ❌ Silent fail: catch error tanpa log, Claude jadi bingung
- ❌ Synchronous I/O: `fs.readFileSync` di hot path

## Debugging

- **Log ke stderr**, bukan stdout — stdout dipakai untuk JSON-RPC
- Enable debug mode:
  ```bash
  DEBUG=mcp:* claude
  ```
- Check Claude Code MCP log di `~/.claude/logs/`

## PR ke `claude-base-dtit`

Kalau MCP kamu mau jadi bagian dari base repo tim:

1. Tambah folder `mcp-servers/{name}/`
2. Tulis README lengkap
3. Sertakan `package.json`, `src/`, `tsconfig.json`
4. Update `mcp-servers/README.md` → tambah row di tabel
5. PR + review
