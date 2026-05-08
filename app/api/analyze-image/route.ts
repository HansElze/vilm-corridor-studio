import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"

const client = new Anthropic()

const RAG_DIR = "C:/Users/dvdel/OneDrive/Desktop/architectural RAG for Multi-Model Model"

const CORRIDOR_CONTEXT = `You are analyzing architectural reference images for the Cuttlefish Labs Philadelphia corridor — a 1.76-mile over/under infrastructure corridor repurposing the City Branch tunnel and Reading Viaduct.

The corridor has three layers:
- OVER: Elevated civic promenade, basalt exosystem, public realm above historic rail shell
- AT-GRADE: Open biophilic trench with vertical gardens, terracing, autonomous mobility
- UNDER: Tunnel reuse — compute nodes, metabolic trunk, thermal system, logistics spine

Design language: industrial-biophilic modernism. Materials: basalt-composite (primary), weathered iron, historic stone, light oak, structural glass. Forms: parametric ribs, exoskeleton nodes, vaulted shells, living walls.

Analyze this image in the specific context of what it tells us about the corridor. Be direct and technical. 3-4 sentences max. Focus on: what design language or infrastructure type is shown, which corridor layer it speaks to, and what specific element of the basalt standard or over/under proof it most relates to.`

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const file = path.basename(searchParams.get("file") ?? "")
  if (!file) return new Response("missing file", { status: 400 })

  const filePath = path.join(RAG_DIR, file)
  if (!fs.existsSync(filePath)) return new Response("not found", { status: 404 })

  const buf = fs.readFileSync(filePath)
  if (buf.byteLength > 4 * 1024 * 1024) return new Response("image too large", { status: 413 })

  const ext = path.extname(file).toLowerCase()
  const mediaType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg"
  const base64 = buf.toString("base64")

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: CORRIDOR_CONTEXT },
      ],
    }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
