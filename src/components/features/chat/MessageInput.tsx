'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Square, Paperclip, X, FileText, Image } from 'lucide-react'

export interface AttachedFile {
  name: string
  type: string
  base64: string
  size: number
}

interface MessageInputProps {
  onSend: (content: string, files?: AttachedFile[]) => void
  isLoading: boolean
  onStop?: () => void
}

const ACCEPTED = '.pdf,.txt,.png,.jpg,.jpeg,.webp,.docx'
const MAX_SIZE_MB = 10

function FileChip({ file, onRemove }: { file: AttachedFile; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/')
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 8px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      fontSize: '11px',
      color: 'var(--text-secondary)',
    }}>
      {isImage ? <Image size={11} /> : <FileText size={11} />}
      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.name}
      </span>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-secondary)' }}
      >
        <X size={11} />
      </button>
    </div>
  )
}

export default function MessageInput({ onSend, isLoading, onStop }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [files, setFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if ((!trimmed && files.length === 0) || isLoading) return
    onSend(trimmed || '📎 Please analyze the attached file(s).', files.length > 0 ? files : undefined)
    setValue('')
    setFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = ''

    selected.forEach((file) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} is too large (max ${MAX_SIZE_MB}MB)`)
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        setFiles((prev) => [...prev, { name: file.name, type: file.type, base64, size: file.size }])
      }
      reader.readAsDataURL(file)
    })
  }

  const canSend = (value.trim() || files.length > 0) && !isLoading

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--background)', paddingBottom: 'max(24px, calc(20px + env(safe-area-inset-bottom)))' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* File chips */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {files.map((f, i) => (
              <FileChip key={i} file={f} onRemove={() => setFiles((prev) => prev.filter((_, j) => j !== i))} />
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '10px 12px',
        }}>
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach file (PDF, Word, image, text)"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              opacity: 0.7,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask about linguistics, or attach a paper/image..."
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
              disabled={!canSend}
              style={{
                background: canSend ? 'var(--accent)' : 'var(--surface-2)',
                border: 'none',
                color: canSend ? '#fff' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '7px',
                cursor: canSend ? 'pointer' : 'default',
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

        {/* Bottom bar: hint + model badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', padding: '0 2px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
            Enter to send · Shift+Enter for new line · 📎 PDF, Word, image, text
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.7 }}>Powered by</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--accent)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '1px 6px',
              letterSpacing: '0.02em',
            }}>
              Claude Sonnet · Pro
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
