'use client'

import { useState, useTransition } from 'react'
import { postComment } from '@/lib/actions/social'
import { toast } from 'sonner'
import type { Comment, Profile } from '@/lib/supabase/types'

export type CommentWithProfile = Comment & {
  profile: Pick<Profile, 'username' | 'avatar_url'> | null
}

type CommentFormProps = {
  toolId: string
  parentId: string | null
  onPosted?: () => void
  placeholder?: string
}

function CommentForm({
  toolId,
  parentId,
  onPosted,
  placeholder = 'Write a comment…',
}: CommentFormProps) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()

  function handlePost() {
    if (!body.trim()) return
    startTransition(async () => {
      const result = await postComment(toolId, parentId, body)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setBody('')
        toast.success('Comment posted')
        onPosted?.()
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <textarea
        className="field-input"
        style={{ flex: 1, minHeight: 60, resize: 'vertical' }}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
      />
      <button
        className="btn primary"
        onClick={handlePost}
        disabled={isPending || !body.trim()}
        style={{ alignSelf: 'flex-end' }}
        type="button"
      >
        {isPending ? '…' : 'Post'}
      </button>
    </div>
  )
}

type CommentItemProps = {
  comment: CommentWithProfile
  toolId: string
  isGuest: boolean
  depth: number
}

function CommentItem({ comment, toolId, isGuest, depth }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div
      style={{
        paddingLeft: depth > 0 ? 24 : 0,
        borderLeft: depth > 0 ? '2px solid var(--line)' : 'none',
        marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--teal-soft)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--teal)',
            flexShrink: 0,
          }}
        >
          {comment.profile?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {comment.profile?.username ?? 'Anonymous'}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 2 }}>
            {comment.body}
          </div>
          {depth < 1 && !isGuest && (
            <button
              className="btn ghost"
              style={{ fontSize: 12, padding: '3px 8px', marginTop: 6 }}
              onClick={() => setShowReply((v) => !v)}
              type="button"
            >
              {showReply ? 'Cancel' : 'Reply'}
            </button>
          )}
          {showReply && (
            <CommentForm
              toolId={toolId}
              parentId={comment.id}
              onPosted={() => setShowReply(false)}
              placeholder="Write a reply…"
            />
          )}
        </div>
      </div>
    </div>
  )
}

type Props = {
  toolId: string
  comments: CommentWithProfile[]
  isGuest: boolean
}

export function CommentThread({ toolId, comments, isGuest }: Props) {
  const rootComments = comments.filter((c) => c.parent_id === null)
  const replies = comments.filter((c) => c.parent_id !== null)

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
      </div>

      {!isGuest && <CommentForm toolId={toolId} parentId={null} />}

      <div style={{ marginTop: 20 }}>
        {rootComments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              toolId={toolId}
              isGuest={isGuest}
              depth={0}
            />
            {replies
              .filter((r) => r.parent_id === comment.id)
              .map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  toolId={toolId}
                  isGuest={isGuest}
                  depth={1}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
