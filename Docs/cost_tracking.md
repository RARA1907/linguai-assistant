# Cost Tracking

## Ekonomik Mod Hedefleri

| Metrik | Hedef | Mevcut |
|--------|-------|--------|
| Cache Hit Rate | >60% | - |
| Avg Latency | <2s | - |
| Token Waste | <20% | - |
| Monthly Cost | <$[HEDEF] | - |

## API Maliyetleri

### AI Models (Vertex AI / OpenAI)

| Model | Input (1M token) | Output (1M token) | Kullanim |
|-------|------------------|-------------------|----------|
| Gemini 1.5 Flash | $0.075 | $0.30 | Hizli isler |
| Gemini 1.5 Pro | $1.25 | $5.00 | Kompleks analiz |

### Third-Party APIs

| API | Fiyatlandirma | Tahmini Kullanim |
|-----|---------------|------------------|
| [API 1] | [Fiyat] | [Kullanim] |
| [API 2] | [Fiyat] | [Kullanim] |

### Infrastructure

| Servis | Maliyet | Notlar |
|--------|---------|--------|
| Vercel | Free / $20/mo | Frontend hosting |
| Supabase | Free / $25/mo | Database + Auth |
| Railway | ~$5-20/mo | Backend hosting |

## Haftalik Rapor Template

```markdown
## Hafta: [TARIH]

### API Kullanimi
- Toplam API Call: X
- Cache Hit: X (Y%)
- Toplam Token: X
- Maliyet: $X

### Sorunlar
- [ ] Cache hit rate dusuk mu?
- [ ] Beklenmedik maliyet artisi var mi?

### Aksiyonlar
- [ ] ...
```

## Aylik Ozet

| Ay | API Cost | Infra Cost | Toplam |
|----|----------|------------|--------|
| [AY] | $X | $Y | $Z |

---
**Son Guncelleme:** [TARIH]
