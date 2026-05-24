'use client'

import { useState } from 'react'
import { ToolCardGrid } from './ToolCardGrid'
import { ToolCardList } from './ToolCardList'
import { SortBar } from './SortBar'
import type { Tool } from '@/lib/supabase/types'

type Props = {
  tools: Tool[]
  isGuest?: boolean
}

export function BrowseCatalogShell({ tools, isGuest = true }: Props) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const LayoutComp = layout === 'grid' ? ToolCardGrid : ToolCardList

  return (
    <>
      <SortBar total={tools.length} onLayoutChange={setLayout} />
      <LayoutComp
        tools={tools}
        upvotedIds={new Set()}
        favoritedIds={new Set()}
        isGuest={isGuest}
      />
    </>
  )
}
