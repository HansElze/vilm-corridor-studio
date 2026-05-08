"use client"

import { useRef, useState } from "react"
import Link from "next/link"

const QUICK_PROMPTS = [
  "What's blocking the thermal system?",
  "Explain the over/under proof to an investor.",
  "What is the Verified Mile Protocol?",
  "How does basalt fit the corridor strategy?",
  "What does the capital trigger stack look like?",
]

export function MiniVilm() {
  const [query, setQuery] = useState("")
  const [asked, setAsked] = useState("")
  const [response, setResponse] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [ttft, setTtft] = useState<number | null>(null)
  const startRef = useRef<number>(0)
  const gotFirstRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function ask(q?: string) {
    const text = (q ?? query).trim()
    if (!text || streaming) return
    setAsked(text)
    setQuery("")
    setResponse("")
    setDone(false)
    setTtft(null)
    gotFirstRef.current = false
    startRef.current = performance.now()
    setStreaming(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      })
      if (!res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      while (true) {
        const { done: rdone, value } = await reader.read()
        if (rdone) break
        if (!gotFirstRef.current) {
          gotFirstRef.current = true
          setTtft(Math.round(performance.now() - startRef.current))
        }
        acc += decoder.decode(value, { stream: true })
        setResponse(acc)
      }
      setDone(true)
    } catch {
      setResponse("VILM engine unavailable.")
      setDone(true)
    } finally {
      setStreaming(false)
    }
  }

  function reset() {
    setAsked("")
    setResponse("")
    setDone(false)
    setTtft(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div>
      {!asked && (
        <>
          <div className="pill-row" style={{ marginBottom: 10, flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                className="pill"
                style={{ cursor: "pointer", fontSize: "0.72rem", color: "var(--teal)", borderColor: "rgba(18,247,255,0.2)" }}
                onClick={() => ask(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") ask() }}
              placeholder="Ask the corridor engine anything — proof gates, under-layer, capital triggers..."
              style={{
                flex: 1,
                background: "rgba(18,247,255,0.05)",
                border: "1px solid rgba(18,247,255,0.2)",
                borderRadius: 4,
                padding: "9px 14px",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: "0.85rem",
              }}
            />
            <button
              className="button primary"
              onClick={() => ask()}
              disabled={!query.trim()}
              style={{ minWidth: 64 }}
            >
              Ask
            </button>
          </div>
        </>
      )}

      {asked && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: "0.72rem", opacity: 0.45, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--teal)" }}>You</span>
            <span>{asked}</span>
          </div>

          <div style={{
            padding: "14px 16px",
            background: "rgba(18,247,255,0.04)",
            border: "1px solid rgba(18,247,255,0.1)",
            borderRadius: 8,
            fontSize: "0.84rem",
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            minHeight: 48,
          }}>
            {response || (streaming ? "" : "")}
            {streaming && <span style={{ opacity: 0.6 }}>{response ? " " : ""}▍</span>}
          </div>

          {(streaming || done) && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {ttft !== null && (
                <span style={{ fontSize: "0.62rem", opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {ttft}ms first token · AMD accelerated
                </span>
              )}
              {done && (
                <>
                  <button
                    className="pill"
                    style={{ cursor: "pointer", fontSize: "0.68rem", marginLeft: "auto" }}
                    onClick={reset}
                  >
                    Ask another
                  </button>
                  <Link
                    href="/vilm"
                    style={{ fontSize: "0.68rem", color: "var(--teal)", opacity: 0.7, textDecoration: "none" }}
                  >
                    Full conversation →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
