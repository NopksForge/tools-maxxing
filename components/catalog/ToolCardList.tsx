import type { Tool } from '@/lib/supabase/types'
import { ToolCard } from './ToolCard'

type Props = {
  tools: Tool[]
  upvotedIds: Set<string>
  favoritedIds: Set<string>
  isGuest: boolean
}

export function ToolCardList({ tools, upvotedIds, favoritedIds, isGuest }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          upvoted={upvotedIds.has(tool.id)}
          favorited={favoritedIds.has(tool.id)}
          variant="list"
          isGuest={isGuest}
        />
      ))}
    </div>
  )
}
