'use client'

import { Conversation } from '@/types'
import { Plus, MessageSquare, Trash2, BookOpen, LogOut } from 'lucide-react'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onTopicClick?: (topic: string) => void
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  onLogout?: () => void
}

const TOPICS = [
  'Phonetics & Phonology',
  'Morphology',
  'Syntax',
  'Semantics',
  'Pragmatics',
  'SLA',
  'Sociolinguistics',
  'Discourse Analysis',
  'Corpus Linguistics',
]

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onTopicClick, isOpen, onClose, userEmail, onLogout }: SidebarProps) {
  const handleSelect = (id: string) => {
    onSelect(id)
    onClose()
  }

  const handleNew = () => {
    onNew()
    onClose()
  }

  const handleTopic = (topic: string) => {
    onTopicClick?.(`Give me an academic overview of ${topic} in linguistics`)
    onClose()
  }

  const displayName = userEmail ? userEmail.split('@')[0].toUpperCase() : ''

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
          className="mobile-backdrop"
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            z-index: 50;
            transform: translateX(${isOpen ? '0' : '-100%'});
            transition: transform 0.25s ease;
            box-shadow: ${isOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none'};
          }
          .mobile-backdrop {
            display: block !important;
          }
        }
      `}</style>

      <aside
        className="sidebar"
        style={{
          width: '260px',
          minWidth: '260px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BookOpen size={20} color="var(--accent)" />
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              LinguAI
            </span>
          </div>
          <button
            onClick={handleNew}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Plus size={15} />
            New Conversation
          </button>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {conversations.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', marginTop: '24px', padding: '0 12px' }}>
              No conversations yet. Start asking!
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  background: activeId === conv.id ? 'var(--surface-2)' : 'transparent',
                  border: activeId === conv.id ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                <MessageSquare size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    color: activeId === conv.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {conv.title}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    opacity: 0.4,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Topics */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Quick Topics
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopic(topic)}
                style={{
                  fontSize: '10px',
                  padding: '3px 7px',
                  background: 'var(--surface-2)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
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
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* User & Logout */}
        {userEmail && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {displayName.charAt(0)}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {displayName}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Çıkış Yap"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: 'var(--text-secondary)',
                display: 'flex',
                borderRadius: '6px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
