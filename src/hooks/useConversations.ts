'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase'
import { Conversation, Message, FileMetadata } from '@/types'

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (userId) loadConversations()
    else setLoading(false)
  }, [userId])

  async function loadConversations() {
    if (!userId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('linguai_conversations')
      .select('*')
      .eq('user_id', userId)
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

        const { data: fileData } = await supabase
          .from('linguai_files')
          .select('*')
          .eq('conversation_id', row.id)

        const filesByMessageId = new Map<string, FileMetadata[]>()
        for (const f of (fileData || [])) {
          const existing = filesByMessageId.get(f.message_id) || []
          existing.push({
            id: f.id,
            fileName: f.file_name,
            fileType: f.file_type,
            fileSize: f.file_size,
            extractedContent: f.extracted_content ?? undefined,
          })
          filesByMessageId.set(f.message_id, existing)
        }

        return {
          id: row.id,
          title: row.title,
          summary: row.summary ?? undefined,
          messages: (msgs || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
            files: filesByMessageId.get(m.id) || undefined,
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
    if (!userId) throw new Error('Not authenticated')
    const id = uuidv4()
    const { error } = await supabase.from('linguai_conversations').insert({
      id,
      user_id: userId,
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
  }, [userId])

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('linguai_conversations').delete().eq('id', id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const addMessage = useCallback(async (conversationId: string, message: Message) => {
    await supabase.from('linguai_messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
    })

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
          : c
      )
    )

    await supabase
      .from('linguai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  }, [])

  const saveFileMetadata = useCallback(async (
    messageId: string,
    conversationId: string,
    files: { name: string; type: string; size: number }[]
  ) => {
    if (!userId || files.length === 0) return
    const rows = files.map((f) => ({
      message_id: messageId,
      conversation_id: conversationId,
      user_id: userId,
      file_name: f.name,
      file_type: f.type,
      file_size: f.size,
    }))
    const { error } = await supabase.from('linguai_files').insert(rows)
    if (error) console.error('Save file metadata error:', error)
  }, [userId])

  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    await supabase
      .from('linguai_conversations')
      .update({ title })
      .eq('id', conversationId)

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
    )
  }, [])

  const updateSummary = useCallback((conversationId: string, summary: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, summary } : c))
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
    saveFileMetadata,
    updateTitle,
    updateSummary,
  }
}
