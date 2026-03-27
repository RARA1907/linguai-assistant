import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinguAI — Linguistics Research Assistant',
  description: 'AI-powered assistant for linguistics graduate research',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
