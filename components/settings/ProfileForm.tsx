'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { toast } from 'sonner'

type Props = {
  username: string | null
  bio: string | null
  avatarUrl: string | null
}

export function ProfileForm({ username, bio, avatarUrl }: Props) {
  const [name, setName] = useState(username ?? '')
  const [bioText, setBio] = useState(bio ?? '')
  const [avatar, setAvatar] = useState(avatarUrl ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile(name, bioText, avatar)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Profile saved')
      }
    })
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>
        Profile
      </h2>

      <div className="field-group">
        <label className="field-label" htmlFor="settings-username">
          Username
        </label>
        <input
          id="settings-username"
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your_handle"
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="settings-bio">
          Bio
        </label>
        <textarea
          id="settings-bio"
          className="field-input"
          rows={3}
          value={bioText}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the community about yourself"
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="settings-avatar">
          Avatar URL
        </label>
        <input
          id="settings-avatar"
          className="field-input"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://example.com/avatar.png"
        />
      </div>

      <button
        className="btn primary"
        onClick={handleSave}
        disabled={isPending}
        type="button"
      >
        {isPending ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  )
}
