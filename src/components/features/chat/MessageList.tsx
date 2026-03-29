'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '@/types'
import { BookOpen, Copy, Check, FileText, Image as ImageIcon } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  streamingContent?: string | null
  onSuggestion?: (text: string) => void
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'inline-block',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function FileChips({ files }: { files: Message['files'] }) {
  if (!files || files.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
      {files.map((f) => (
        <span
          key={f.id}
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            background: 'var(--surface-2)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {f.fileType.startsWith('image/') ? <ImageIcon size={10} /> : <FileText size={10} />}
          {f.fileName}
          <span style={{ opacity: 0.6 }}>
            ({f.fileSize < 1024 ? `${f.fileSize} B` : `${(f.fileSize / 1024).toFixed(0)} KB`})
          </span>
        </span>
      ))}
    </div>
  )
}

function EmptyState({ onSuggestion }: { onSuggestion?: (text: string) => void }) {
  const suggestions = [
    'Explain the Minimalist Program in syntax',
    'What is the difference between phonetics and phonology?',
    'How does Grice\'s Cooperative Principle work?',
    'Explain SLA input hypothesis by Krashen',
    'What is covert presupposition?',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px' }}>
      <div style={{ background: 'var(--surface-2)', borderRadius: '50%', padding: '20px', marginBottom: '16px' }}>
        <BookOpen size={32} color="var(--accent)" />
      </div>
      <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
        LinguAI Research Assistant
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', marginBottom: '28px', maxWidth: '400px', lineHeight: 1.6 }}>
        Expert-level support for linguistics research, theory, and academic writing.
      </p>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', textAlign: 'center' }}>
          Try asking
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion?.(s)}
              style={{
                padding: '10px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy response"
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '4px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: copied ? '#22C55E' : 'var(--text-secondary)',
        fontSize: '11px',
        transition: 'color 0.15s, border-color 0.15s',
        marginTop: '6px',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function MessageList({ messages, isLoading, streamingContent, onSuggestion }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading && !streamingContent) {
    return <EmptyState onSuggestion={onSuggestion} />
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--user-bubble)' : 'var(--ai-bubble)',
                border: '1px solid var(--border)',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              {msg.role === 'user' ? (
                <>
                  <p style={{ margin: 0, color: 'var(--text-primary)' }}>{msg.content}</p>
                  <FileChips files={msg.files} />
                </>
              ) : (
                <div className="prose-linguistics">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', padding: '0 4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {msg.role === 'user' ? 'You' : 'LinguAI'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.role === 'assistant' && <CopyButton text={msg.content} />}
            </div>
          </div>
        ))}

        {streamingContent !== null && streamingContent !== undefined ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--ai-bubble)',
                border: '1px solid var(--border)',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              {streamingContent === '' ? (
                <TypingIndicator />
              ) : (
                <div className="prose-linguistics">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                </div>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 4px' }}>
              LinguAI · {streamingContent === '' ? 'Thinking...' : 'Typing...'}
            </span>
          </div>
        ) : isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--ai-bubble)',
                border: '1px solid var(--border)',
              }}
            >
              <TypingIndicator />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 4px' }}>LinguAI · Thinking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
