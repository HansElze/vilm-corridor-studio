import type { Metadata } from "next"
import "./globals.css"
import { TopNav } from "@/components/top-nav"
import { Rajdhani, Share_Tech_Mono } from "next/font/google"

const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-rajdhani" })
const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--font-mono" })

export const metadata: Metadata = {
  title: "VILM — Vertically Integrated Language Model · Cuttlefish Labs",
  description: "Domain-fused AI for urban infrastructure corridors. Philadelphia City Branch / Reading Viaduct proof case. AMD GPU-accelerated vision RAG + digital twin + Claude Haiku. AMD Developer Hackathon 2026.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${shareTechMono.variable}`}>
      <body>
        <div className="app-shell">
          <TopNav />
          {children}
        </div>
      </body>
    </html>
  )
}
