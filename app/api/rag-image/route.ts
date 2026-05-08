import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const RAG_DIR =
  process.env.RAG_IMAGE_DIR ??
  "C:/Users/dvdel/OneDrive/Desktop/architectural RAG for Multi-Model Model"

const CONTENT_TYPES: Record<string, string> = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file")
  if (!file) {
    return new NextResponse("Missing file param", { status: 400 })
  }

  // Prevent directory traversal — only allow bare filenames
  const filename = path.basename(file)
  if (filename !== file) {
    return new NextResponse("Invalid filename", { status: 400 })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) {
    return new NextResponse("Unsupported file type", { status: 400 })
  }

  const filePath = path.join(RAG_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  })
}
