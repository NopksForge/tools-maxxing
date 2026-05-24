'use client'

import { useState, useTransition } from 'react'
import { createCollection } from '@/lib/actions/collections'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function NewCollectionForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCreate() {
    if (!name.trim()) {
      toast.error('Collection name is required')
      return
    }
    startTransition(async () => {
      const result = await createCollection(name, description, isPublic)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Collection created')
        router.push(`/collections/${result.data.slug}`)
      }
    })
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>
        New collection
      </h2>

      <div className="field-group">
        <label className="field-label" htmlFor="col-name">
          Name
        </label>
        <input
          id="col-name"
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My AI coding tools"
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="col-desc">
          Description (optional)
        </label>
        <textarea
          id="col-desc"
          className="field-input"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this collection about?"
        />
      </div>

      <div className="field-group">
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}
        >
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make this collection public
        </label>
      </div>

      <button
        className="btn primary"
        onClick={handleCreate}
        disabled={isPending}
        type="button"
      >
        {isPending ? 'Creating…' : 'Create collection'}
      </button>
    </div>
  )
}
