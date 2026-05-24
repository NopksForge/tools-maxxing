'use client'

import { useState, useTransition } from 'react'
import { submitTool } from '@/lib/actions/catalog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Tag = { id?: string; name: string }
type MediaItem = { type: 'image' | 'video'; url: string }

type Props = {
  url: string
  onBack: () => void
}

export function StepDetails({ url, onBack }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [pricing, setPricing] = useState<'open_source' | 'freemium' | 'paid' | 'free'>('free')
  const [deployment, setDeployment] = useState<string[]>(['cloud'])
  const [isByok, setIsByok] = useState(false)
  const [hasApi, setHasApi] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [mediaInput, setMediaInput] = useState('')

  function toggleDeployment(val: string) {
    setDeployment((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    )
  }

  function addTag() {
    const trimmed = tagInput.trim()
    if (!trimmed || tags.some((t) => t.name === trimmed)) return
    setTags((prev) => [...prev, { name: trimmed }])
    setTagInput('')
  }

  function removeTag(name: string) {
    setTags((prev) => prev.filter((t) => t.name !== name))
  }

  function addMedia() {
    const trimmed = mediaInput.trim()
    if (!trimmed) return
    setMedia((prev) => [...prev, { type: 'image', url: trimmed }])
    setMediaInput('')
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error('Tool name is required.')
      return
    }
    startTransition(async () => {
      const result = await submitTool({
        url,
        name,
        description,
        logo_url: logoUrl,
        repo_url: repoUrl,
        pricing_model: pricing,
        deployment,
        is_byok: isByok,
        has_api: hasApi,
        tags,
        media,
      })
      if ('error' in result) {
        toast.error(result.error)
      } else {
        router.push(`/tools/${result.data.slug}`)
      }
    })
  }

  return (
    <div className="wizard-step">
      <div className="eyebrow">Step 2 of 2</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 4px' }}>
        Tool Details
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>
        URL: <code style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{url}</code>
      </p>

      <div className="field-group">
        <label className="field-label" htmlFor="tool-name">Name *</label>
        <input id="tool-name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Claude Code" />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="tool-desc">Description</label>
        <textarea id="tool-desc" className="field-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this tool do?" />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="tool-logo">Logo URL</label>
        <input id="tool-logo" className="field-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="tool-repo">Repository URL (optional)</label>
        <input id="tool-repo" className="field-input" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repo" />
      </div>

      <fieldset className="field-group" style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
        <legend className="field-label">Pricing</legend>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
          {(['free', 'open_source', 'freemium', 'paid'] as const).map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input type="radio" name="pricing" value={p} checked={pricing === p} onChange={() => setPricing(p)} />
              {p.replace('_', ' ')}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field-group" style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
        <legend className="field-label">Deployment</legend>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
          {(['cloud', 'local', 'hybrid'] as const).map((d) => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={deployment.includes(d)} onChange={() => toggleDeployment(d)} />
              {d}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field-group" style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={isByok} onChange={(e) => setIsByok(e.target.checked)} />
          BYOK
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
          <input type="checkbox" checked={hasApi} onChange={(e) => setHasApi(e.target.checked)} />
          Has API
        </label>
      </div>

      <div className="field-group">
        <label className="field-label">Tags</label>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map((t) => (
              <span key={t.name} className="chip chip-active">
                {t.name}
                <button
                  type="button"
                  onClick={() => removeTag(t.name)}
                  style={{ marginLeft: 4, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="field-input"
            style={{ flex: 1 }}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Type a tag and press Enter"
          />
          <button className="btn secondary" onClick={addTag} type="button">Add</button>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Screenshots / Media URLs (optional)</label>
        {media.map((m, i) => (
          <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>{m.url}</div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="field-input"
            style={{ flex: 1 }}
            value={mediaInput}
            onChange={(e) => setMediaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMedia() } }}
            placeholder="https://example.com/screenshot.png"
          />
          <button className="btn secondary" onClick={addMedia} type="button">Add</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        <button className="btn ghost" onClick={onBack} disabled={isPending}>Back</button>
        <button className="btn primary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit tool'}
        </button>
      </div>
    </div>
  )
}
