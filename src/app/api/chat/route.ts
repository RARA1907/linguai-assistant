import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { LINGUISTICS_SYSTEM_PROMPT } from '@/lib/anthropic'

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
    const { messages, files } = await req.json() as { messages: Message[], files?: AttachedFile[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Build message array — history as plain text, last user message optionally with files
    const builtMessages: Anthropic.MessageParam[] = messages.map((m, i) => {
      const isLastUser = i === messages.length - 1 && m.role === 'user' && files && files.length > 0
      if (!isLastUser) {
        return { role: m.role, content: m.content }
      }

      const contentBlocks: ContentBlock[] = [{ type: 'text', text: m.content }]

      for (const file of files!) {
        if (file.type === 'application/pdf') {
          contentBlocks.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: file.base64 },
            title: file.name,
          })
        } else if (file.type.startsWith('image/')) {
          contentBlocks.push({
            type: 'image',
            source: { type: 'base64', media_type: file.type, data: file.base64 },
          })
        } else if (file.type === 'text/plain') {
          const text = Buffer.from(file.base64, 'base64').toString('utf-8')
          contentBlocks.push({ type: 'text', text: `\n\n---\n📄 ${file.name}:\n${text}` })
        }
      }

      return { role: m.role as 'user', content: contentBlocks as Anthropic.ContentBlockParam[] }
    })

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: LINGUISTICS_SYSTEM_PROMPT,
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
