'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string) => void
  isLoading: boolean
  onStop?: () => void
}

export default function MessageInput({ onSend, isLoading, onStop }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 12px',
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask about linguistics, theories, research methods..."
            rows={1}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          />
          {isLoading ? (
            <button
              onClick={onStop}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              style={{
                background: value.trim() ? 'var(--accent)' : 'var(--surface-2)',
                border: 'none',
                color: value.trim() ? '#fff' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '7px',
                cursor: value.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
