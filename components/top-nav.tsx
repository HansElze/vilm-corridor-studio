"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const links = [
  { href: "/", label: "Overview" },
  { href: "/hackathon", label: "Hackathon" },
  { href: "/corridor-studio", label: "Corridor Studio" },
  { href: "/investor", label: "Investor" },
  { href: "/ccl", label: "CCL" },
  { href: "/twin", label: "Twin" },
  { href: "/proof", label: "Proof" },
  { href: "/model", label: "3D Model" },
  { href: "/vilm", label: "VILM" },
]

export function TopNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-kicker">Cuttlefish Labs · AMD Developer Hackathon 2026</div>
        <div className="brand-title">VILM — Vertically Integrated Language Model</div>
        <div className="brand-subtitle">
          Philadelphia City Branch / Reading Viaduct · Vision &amp; Multimodal AI · Proof-Gated Infrastructure Stack · 1.76 mi Over/Under
        </div>
      </div>

      <button
        className="nav-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? "✕ close" : "☰ menu"}
      </button>

      <nav className={`nav-links${open ? " open" : ""}`} aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${pathname === link.href ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
