"use client"

import { useEffect, useRef } from "react"

type PrototypeFrameProps = {
  presentationMode?: boolean
  scene?: number
  title: string
}

export function PrototypeFrame({ presentationMode = false, scene, title }: PrototypeFrameProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const applyMode = () => {
      const win = frame.contentWindow as
        | (Window & {
            togglePresentationMode?: (forceState?: boolean | null) => void
            applyPresentationScene?: (targetId: number) => void
          })
        | null

      if (!win) return
      if (typeof win.togglePresentationMode === "function") {
        win.togglePresentationMode(presentationMode)
      }
      if (presentationMode && scene && typeof win.applyPresentationScene === "function") {
        win.applyPresentationScene(scene)
      }
    }

    frame.addEventListener("load", applyMode)
    applyMode()
    return () => frame.removeEventListener("load", applyMode)
  }, [presentationMode, scene])

  return (
    <div className="frame-shell">
      <iframe
        ref={frameRef}
        title={title}
        src="/prototype/index.html"
        className="prototype-frame"
      />
    </div>
  )
}
