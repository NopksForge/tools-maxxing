import type { Tool } from '@/lib/supabase/types'
import { ToolCard } from './ToolCard'

type Props = {
  tools: Tool[]
  upvotedIds: Set<string>
  favoritedIds: Set<string>
  isGuest: boolean
}

export function ToolCardGrid({ tools, upvotedIds, favoritedIds, isGuest }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}
    >
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          upvoted={upvotedIds.has(tool.id)}
          favorited={favoritedIds.has(tool.id)}
          variant="grid"
          isGuest={isGuest}
        />
      ))}
    </div>
  )
}
