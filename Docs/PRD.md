# LinguAI Assistant — PRD

**Olusturulma:** 2026-03-27
**Son Guncelleme:** 2026-03-27

## Tanim
Yüksek lisans dilbilim öğrencisi için kişiselleştirilmiş AI asistan web uygulaması. Claude API tabanlı, kalıcı konuşma geçmişi, kaynak yükleme ve dilbilim odaklı sistem prompt ile çalışır.

## Hedef Kitle
- Tek kullanıcı (Kaptan'ın kızı)
- İngilizce dilbilim yüksek lisans öğrencisi
- Araştırma, konu öğrenimi, tez desteği ihtiyacı

## Temel Özellikler

### MVP — Phase 1
- [ ] Chat arayüzü (Claude API ile)
- [ ] Dilbilim odaklı sistem prompt (uzman seviye)
- [ ] Konuşma geçmişi kalıcı (Supabase)
- [ ] Session yönetimi (yeni / eski konuşmalar)
- [ ] Markdown render (tablolar, listeler, kod blokları)
- [ ] Supabase Auth (tek kullanıcı, email/password)

### Phase 2 — Kaynak & Not
- [ ] PDF yükleme ve analiz (RAG)
- [ ] Konu kategorileri sidebar (Phonology, Syntax, Semantics...)
- [ ] Not alma & kaydetme (konuşmadan not çıkarma)
- [ ] Geçmiş konuşmalarda arama

### Phase 3 — Akademik Araçlar
- [ ] Tez yazım asistanı modu
- [ ] Alıntı/referans formatı (APA 7th)
- [ ] Flashcard üretimi (otomatik)
- [ ] Vocabulary tracker (dilbilim terimleri)

## Teknik Gereksinimler

### Frontend
- Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript 5
- UI: temiz akademik tasarım, koyu/açık mod

### Backend
- Next.js API Routes (yeterli, FastAPI gerekmez)
- Supabase (Auth + PostgreSQL) — konuşma geçmişi
- Claude API (claude-sonnet-4-6) — Anthropic SDK

### Deployment
- Vercel (frontend + API routes)

## Maliyet Tahmini
| Kalem | Maliyet |
|-------|---------|
| Claude Sonnet API | ~$2-5/ay |
| Supabase Free Tier | $0 |
| Vercel Free Tier | $0 |
| **Toplam** | **~$3-5/ay** |

## Başarı Kriterleri
1. Konuşma geçmişi kaybolmadan birikir
2. Dilbilim sorularına uzman seviye yanıt
3. Sayfa yükleme <2 saniye
4. Mobil uyumlu arayüz
