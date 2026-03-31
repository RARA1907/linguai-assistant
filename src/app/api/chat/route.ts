import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import { LINGUISTICS_SYSTEM_PROMPT } from '@/lib/anthropic'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AttachedFile {
  name: string
  type: string
  base64: string
}

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'document'; source: { type: 'base64'; media_type: string; data: string }; title?: string }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { messages, files, conversationId, messageId } = await req.json() as {
      messages: Message[]
      files?: AttachedFile[]
      conversationId?: string
      messageId?: string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // --- Seviye 2: Summary fetch ---
    let conversationSummary = ''
    if (conversationId) {
      const { data: convRow } = await supabase
        .from('linguai_conversations')
        .select('summary')
        .eq('id', conversationId)
        .single()
      if (convRow?.summary) {
        conversationSummary = convRow.summary
      }
    }

    // --- Seviye 1: Daha önce yüklenen dosyaların içeriklerini çek ---
    let previousFileContexts = ''
    if (conversationId) {
      const { data: fileRows } = await supabase
        .from('linguai_files')
        .select('file_name, file_type, extracted_content')
        .eq('conversation_id', conversationId)
        .not('extracted_content', 'is', null)

      if (fileRows && fileRows.length > 0) {
        const contexts = fileRows
          .filter((f: any) => f.extracted_content)
          .map((f: any) => `📄 ${f.file_name}:\n${f.extracted_content}`)
        if (contexts.length > 0) {
          previousFileContexts = contexts.join('\n\n---\n\n')
        }
      }
    }

    // Zenginleştirilmiş system prompt
    let enrichedSystemPrompt = LINGUISTICS_SYSTEM_PROMPT

    if (conversationSummary) {
      enrichedSystemPrompt += `\n\n---\n## Önceki Konuşma Özeti\n${conversationSummary}`
    }

    if (previousFileContexts) {
      enrichedSystemPrompt += `\n\n---\n## Bu Konuşmada Yüklenen Dosyalar\nAşağıdaki dosyalar bu konuşmada daha önce paylaşıldı, referans alabilirsin:\n\n${previousFileContexts}`
    }

    // Mesaj geçmişini oluştur
    const builtMessages: Anthropic.MessageParam[] = await Promise.all(
      messages.map(async (m, i) => {
        const isLastUser = i === messages.length - 1 && m.role === 'user' && files && files.length > 0
        if (!isLastUser) {
          return { role: m.role, content: m.content }
        }

        const contentBlocks: ContentBlock[] = [{ type: 'text', text: m.content }]
        const extractedContents: { name: string; content: string }[] = []

        for (const file of files!) {
          if (file.type === 'application/pdf') {
            contentBlocks.push({
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: file.base64 },
              title: file.name,
            })
            // PDF için extracted_content olarak base64'ü kaydetmiyoruz (çok büyük),
            // bunun yerine Claude'un PDF'den çıkaracağı içeriği sonraki mesajlarda summary ile taşırız.
            // Placeholder kaydediyoruz ki "yüklendi" bilgisi kalsın.
            extractedContents.push({ name: file.name, content: `[PDF dosyası - ${file.name}]` })
          } else if (file.type.startsWith('image/')) {
            contentBlocks.push({
              type: 'image',
              source: { type: 'base64', media_type: file.type, data: file.base64 },
            })
            extractedContents.push({ name: file.name, content: `[Görsel - ${file.name}]` })
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const buffer = Buffer.from(file.base64, 'base64')
            const { value: text } = await mammoth.extractRawText({ buffer })
            contentBlocks.push({ type: 'text', text: `\n\n---\n📄 ${file.name} (Word):\n${text}` })
            extractedContents.push({ name: file.name, content: text })
          } else if (file.type === 'text/plain') {
            const text = Buffer.from(file.base64, 'base64').toString('utf-8')
            contentBlocks.push({ type: 'text', text: `\n\n---\n📄 ${file.name}:\n${text}` })
            extractedContents.push({ name: file.name, content: text })
          }
        }

        // --- Seviye 1: Extracted content'i DB'ye kaydet ---
        if (conversationId && messageId && extractedContents.length > 0) {
          for (const ec of extractedContents) {
            await supabase
              .from('linguai_files')
              .update({ extracted_content: ec.content })
              .eq('message_id', messageId)
              .eq('file_name', ec.name)
          }
        }

        return { role: m.role as 'user', content: contentBlocks as Anthropic.ContentBlockParam[] }
      })
    )

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: enrichedSystemPrompt,
      messages: builtMessages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Chat API error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
