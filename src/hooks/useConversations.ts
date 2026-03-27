'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { Conversation, Message } from '@/types'

const SESSION_ID = 'linguai_user' // single-user app

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('linguai_conversations')
      .select('*')
      .eq('user_id', SESSION_ID)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to load conversations:', error)
      setLoading(false)
      return
    }

    const convs: Conversation[] = await Promise.all(
      (data || []).map(async (row: any) => {
        const { data: msgs } = await supabase
          .from('linguai_messages')
          .select('*')
          .eq('conversation_id', row.id)
          .order('created_at', { ascending: true })

        return {
          id: row.id,
          title: row.title,
          messages: (msgs || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          })),
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        }
      })
    )

    setConversations(convs)
    setLoading(false)
  }

  const createConversation = useCallback(async (title: string): Promise<string> => {
    const id = uuidv4()
    const { error } = await supabase.from('linguai_conversations').insert({
      id,
      user_id: SESSION_ID,
      title,
    })
    if (error) console.error('Create conversation error:', error)

    const newConv: Conversation = {
      id,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations((prev) => [newConv, ...prev])
    setActiveId(id)
    return id
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('linguai_conversations').delete().eq('id', id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const addMessage = useCallback(async (conversationId: string, message: Message) => {
    // Persist to Supabase
    await supabase.from('linguai_messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
    })

    // Update local state
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
          : c
      )
    )

    // Update conversation updated_at
    await supabase
      .from('linguai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  }, [])

  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    await supabase
      .from('linguai_conversations')
      .update({ title })
      .eq('id', conversationId)

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
    )
  }, [])

  return {
    conversations,
    activeId,
    setActiveId,
    loading,
    createConversation,
    deleteConversation,
    addMessage,
    updateTitle,
  }
}
