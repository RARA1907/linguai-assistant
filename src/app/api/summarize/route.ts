import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const SUMMARY_THRESHOLD = 10  // Bu kadar mesajdan sonra özet oluştur
const KEEP_RECENT = 6          // Son bu kadar mesajı özetleme, taze tut

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { conversationId } = await req.json() as { conversationId: string }

    if (!conversationId) {
      return new Response(JSON.stringify({ error: 'conversationId required' }), { status: 400 })
    }

    // Tüm mesajları çek
    const { data: msgs, error: msgsError } = await supabase
      .from('linguai_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (msgsError || !msgs) {
      return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), { status: 500 })
    }

    if (msgs.length < SUMMARY_THRESHOLD) {
      return new Response(JSON.stringify({ skipped: true, reason: 'Not enough messages' }), { status: 200 })
    }

    // Özetlenecek mesajlar: son KEEP_RECENT hariç hepsi
    const toSummarize = msgs.slice(0, msgs.length - KEEP_RECENT)

    if (toSummarize.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: 'Nothing to summarize' }), { status: 200 })
    }

    // Mevcut özeti de çek (varsa üzerine ekle)
    const { data: convRow } = await supabase
      .from('linguai_conversations')
      .select('summary')
      .eq('id', conversationId)
      .single()

    const existingSummary = convRow?.summary ?? ''

    // Konuşma metnini hazırla
    const conversationText = toSummarize
      .map((m: any) => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`)
      .join('\n\n')

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const summaryPrompt = existingSummary
      ? `Aşağıda bir konuşmanın mevcut özeti ve yeni konuşma kısmı var. Bunları birleştirerek güncellenmiş, kapsamlı bir özet oluştur. Sadece özeti yaz, başka bir şey ekleme.

MEVCUT ÖZET:
${existingSummary}

YENİ KONUŞMA BÖLÜMÜ:
${conversationText}`
      : `Aşağıdaki konuşmayı özetle. Konuşulan ana konuları, sorulan soruları, verilen önemli bilgileri ve varılan sonuçları kısa ve net şekilde yaz. Sadece özeti yaz, başka bir şey ekleme.

KONUŞMA:
${conversationText}`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: summaryPrompt }],
    })

    const summary = response.content[0].type === 'text' ? response.content[0].text : ''

    if (!summary) {
      return new Response(JSON.stringify({ error: 'Summary generation failed' }), { status: 500 })
    }

    // Özeti DB'ye kaydet
    const { error: updateError } = await supabase
      .from('linguai_conversations')
      .update({
        summary,
        summary_updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to save summary' }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, summary }), { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Summarize API error:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
