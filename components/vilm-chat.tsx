"use client"

import { useEffect, useRef, useState } from "react"
import { loadManifest, searchImages, imageUrl, type ImageEntry, type ImageManifest } from "@/lib/image-rag"

type Message = { role: "user" | "assistant"; content: string }

const STARTERS = [
  "What is the status of the west tunnel?",
  "What's blocking the thermal system?",
  "Explain the over/under proof sequence for investors.",
  "What does the metabolic trunk consist of?",
  "What are the flood risks for the under-layer?",
  "Which proof gate is most critical right now?",
  "What does basalt have to do with this corridor?",
  "What is the capital trigger stack and how does T6 unlock?",
  "Describe the Reading Viaduct as a design surface.",
  "What is the Verified Mile Protocol?",
]

const FOLLOWUP_MAP: Array<{ keyword: string; question: string }> = [
  { keyword: "thermal", question: "What's the thermal exchange loop capacity?" },
  { keyword: "compute", question: "How does immersion-cooled compute fit in the tunnel bore?" },
  { keyword: "capital", question: "Walk me through the T0–T6 capital trigger stack." },
  { keyword: "flood", question: "How do the 500-year flood zones constrain the under-layer?" },
  { keyword: "anchor", question: "What's the east viaduct anchor's current evidence class?" },
  { keyword: "basalt", question: "Why basalt-composite for the metabolic trunk conduit?" },
  { keyword: "viaduct", question: "What's the Reading Viaduct's structural condition today?" },
  { keyword: "scenario", question: "What does Scenario B unlock beyond Scenario A?" },
  { keyword: "proof", question: "Which proof gate is the critical path right now?" },
  { keyword: "metabolic", question: "What subsystems make up the metabolic trunk?" },
  { keyword: "over-layer", question: "What is the over-layer civic and revenue strategy?" },
  { keyword: "under-layer", question: "Walk me through all five under-layer subsystems." },
  { keyword: "investor", question: "How should an investor read the readiness scores?" },
  { keyword: "verified mile", question: "What does stage 3 of the Verified Mile Protocol require?" },
  { keyword: "biophilic", question: "Where does biophilic design appear in the trench section?" },
  { keyword: "30th street", question: "What is the 30th Street pilot node's role in the proof?" },
  { keyword: "tunnel", question: "What is the tunnel bore's reuse case for the metabolic trunk?" },
]

const CATEGORY_KEYWORDS: Record<string, string> = {
  "viaduct":      "elevated civic viaduct",
  "promenade":    "elevated civic viaduct",
  "tunnel":       "underground infrastructure tunnel",
  "underground":  "underground infrastructure",
  "compute":      "underground infrastructure",
  "metabolic":    "underground infrastructure",
  "trench":       "biophilic trench",
  "concourse":    "concourse interior",
  "station":      "concourse interior",
  "basalt":       "basalt material",
  "parametric":   "parametric structure",
  "rib":          "parametric structure",
  "reuse":        "industrial reuse",
  "biophilic":    "biophilic integration greenery",
  "greenery":     "biophilic integration greenery",
  "thermal":      "underground infrastructure",
  "immersion":    "underground infrastructure",
  "over-layer":   "elevated civic viaduct",
  "under-layer":  "underground infrastructure",
}

function extractFollowups(text: string): string[] {
  const lower = text.toLowerCase()
  const seen = new Set<string>()
  const result: string[] = []
  for (const { keyword, question } of FOLLOWUP_MAP) {
    if (lower.includes(keyword) && !seen.has(question)) {
      seen.add(question)
      result.push(question)
      if (result.length >= 3) break
    }
  }
  return result
}

function extractImagesFromResponse(text: string, manifest: ImageManifest): ImageEntry[] {
  const lower = text.toLowerCase()
  for (const [keyword, query] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return searchImages(manifest, query, 4)
    }
  }
  return []
}

export function VilmChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [imagesByMsg, setImagesByMsg] = useState<Record<number, ImageEntry[]>>({})
  const [followupsByMsg, setFollowupsByMsg] = useState<Record<number, string[]>>({})
  const [manifest, setManifest] = useState<ImageManifest | null>(null)
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadManifest().then(m => { if (m) setManifest(m) }) }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || streaming) return
    setInput("")

    const next: Message[] = [...messages, { role: "user", content }]
    setMessages(next)
    setStreaming(true)

    const assistantIdx = next.length
    const assistantMsg: Message = { role: "assistant", content: "" }
    setMessages([...next, assistantMsg])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.body) throw new Error("No stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages([...next, { role: "assistant", content: accumulated }])
      }

      if (manifest) {
        const imgs = extractImagesFromResponse(accumulated, manifest)
        if (imgs.length > 0) {
          setImagesByMsg(prev => ({ ...prev, [assistantIdx]: imgs }))
        }
      }
      const followups = extractFollowups(accumulated)
      if (followups.length > 0) {
        setFollowupsByMsg(prev => ({ ...prev, [assistantIdx]: followups }))
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Error reaching VILM engine." }])
    } finally {
      setStreaming(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div className="eyebrow" style={{ marginBottom: 0 }}>VILM Live Query</div>
        <span style={{ fontSize: "0.6rem", opacity: 0.4, marginLeft: "auto", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Claude Haiku · AMD Accelerated
        </span>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => { setMessages([]); setImagesByMsg({}); setFollowupsByMsg({}) }}
            disabled={streaming}
            style={{ fontSize: "0.65rem", padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted)", background: "none", cursor: "pointer" }}
          >
            Clear
          </button>
        )}
      </div>
      <h4 style={{ margin: "0 0 12px" }}>Ask the corridor engine anything</h4>

      {messages.length === 0 && (
        <div className="pill-row" style={{ flexWrap: "wrap", marginBottom: 16 }}>
          {STARTERS.map((s) => (
            <button
              key={s}
              className="pill"
              style={{ cursor: "pointer", fontSize: "0.72rem" }}
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={{
          maxHeight: "min(640px, calc(100vh - 420px))",
          overflowY: "auto",
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%",
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: "0.82rem",
                lineHeight: 1.6,
                background: m.role === "user" ? "rgba(18,247,255,0.12)" : "rgba(255,255,255,0.04)",
                border: m.role === "user" ? "1px solid rgba(18,247,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                whiteSpace: "pre-wrap",
              }}>
                {m.content || (streaming && i === messages.length - 1 ? "▍" : "")}
              </div>

              {/* Inline images for assistant messages */}
              {m.role === "assistant" && imagesByMsg[i] && imagesByMsg[i].length > 0 && (
                <div style={{ maxWidth: "82%", marginTop: 8 }}>
                  <div style={{ fontSize: "0.65rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
                    Visual references
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                    {imagesByMsg[i].map(entry => (
                      <div key={entry.filename}>
                        <img
                          src={imageUrl(entry)}
                          alt={entry.description}
                          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 3, background: "#0a1a22" }}
                          loading="lazy"
                          title={entry.description}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up suggestions for last assistant message */}
              {m.role === "assistant" && !streaming && i === messages.length - 1 && followupsByMsg[i] && followupsByMsg[i].length > 0 && (
                <div style={{ maxWidth: "82%", marginTop: 8 }}>
                  <div style={{ fontSize: "0.6rem", opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                    Follow-up
                  </div>
                  <div className="pill-row" style={{ flexWrap: "wrap" }}>
                    {followupsByMsg[i].map(q => (
                      <button
                        key={q}
                        className="pill"
                        style={{ cursor: "pointer", fontSize: "0.68rem", textAlign: "left", color: "var(--teal)", borderColor: "rgba(18,247,255,0.2)" }}
                        onClick={() => send(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span style={{ fontSize: "0.65rem", opacity: 0.35, marginTop: 3, paddingInline: 4 }}>
                {m.role === "user" ? "You" : "VILM"}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={streaming}
          placeholder="Ask about proof gates, under/over layer, thermal systems, anchors..."
          rows={2}
          style={{
            flex: 1,
            background: "rgba(18,247,255,0.05)",
            border: "1px solid rgba(18,247,255,0.2)",
            borderRadius: 4,
            padding: "8px 12px",
            color: "var(--text)",
            fontFamily: "inherit",
            fontSize: "0.85rem",
            resize: "none",
            opacity: streaming ? 0.6 : 1,
          }}
        />
        <button
          className="button"
          onClick={() => send()}
          disabled={streaming || !input.trim()}
          style={{ alignSelf: "flex-end", opacity: streaming ? 0.5 : 1 }}
        >
          {streaming ? "..." : "Send"}
        </button>
      </div>

      {messages.length > 0 && (
        <button
          className="pill"
          style={{ cursor: "pointer", marginTop: 8, fontSize: "0.7rem" }}
          onClick={() => { setMessages([]); setImagesByMsg({}); setFollowupsByMsg({}) }}
        >
          Clear conversation
        </button>
      )}
    </div>
  )
}
