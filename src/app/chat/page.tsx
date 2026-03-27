'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/features/chat/Sidebar'
import MessageList from '@/components/features/chat/MessageList'
import MessageInput, { AttachedFile } from '@/components/features/chat/MessageInput'
import { useConversations } from '@/hooks/useConversations'
import { Message } from '@/types'

function generateTitle(firstMessage: string): string {
  return firstMessage.length > 45 ? firstMessage.slice(0, 45) + '...' : firstMessage
}

export default function ChatPage() {
  const {
    conversations,
    activeId,
    setActiveId,
    loading,
    createConversation,
    deleteConversation,
    addMessage,
    updateTitle,
  } = useConversations()

  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  // On desktop, sidebar is always visible; on mobile it starts closed
  useEffect(() => {
    const check = () => setSidebarOpen(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleNew = useCallback(async () => {
    await createConversation('New conversation')
  }, [createConversation])

  const handleSend = useCallback(async (content: string, files?: AttachedFile[]) => {
    let currentId = activeId

    if (!currentId) {
      currentId = await createConversation(generateTitle(content))
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    await addMessage(currentId, userMessage)

    const conv = conversations.find((c) => c.id === currentId)
    if (conv && conv.messages.length === 0) {
      await updateTitle(currentId, generateTitle(content))
    }

    setIsLoading(true)
    setStreamingContent('')

    try {
      const currentConv = conversations.find((c) => c.id === currentId)
      const history = currentConv ? currentConv.messages : []
      const messagesToSend = [...history, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToSend, files }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json()
        throw new Error(data.error || 'API error')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingContent(accumulated)
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: accumulated,
        timestamp: new Date(),
      }

      setStreamingContent(null)
      await addMessage(currentId, assistantMessage)
    } catch (err) {
      setStreamingContent(null)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }
      await addMessage(currentId, errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [activeId, conversations, createConversation, addMessage, updateTitle])

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)' }}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
        onDelete={deleteConversation}
        onTopicClick={handleSend}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="hamburger-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-primary)',
              }}
            >
              <Menu size={20} />
            </button>
            <style>{`
              @media (max-width: 768px) {
                .hamburger-btn { display: flex !important; }
              }
            `}</style>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
                {activeConversation?.title ?? 'LinguAI'}
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Linguistics Research Assistant · claude-sonnet-4-6
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Loading...</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Online</span>
            </div>
          </div>
        </div>
        <MessageList
          messages={activeConversation?.messages ?? []}
          isLoading={isLoading}
          streamingContent={streamingContent}
          onSuggestion={handleSend}
        />
        <MessageInput onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  )
}
