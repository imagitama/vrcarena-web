import React, { useState } from 'react'
import { itemsWithPopularOnes } from '../../taxonomy'
import TaxonomyTree from '../taxonomy-tree'

export default ({
  assetId = undefined,
  currentRanks = []
}: {
  assetId?: string
  currentRanks?: string[]
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(currentRanks)
  const [highlightedIds, setHighlightedIds] = useState<string[]>(currentRanks)

  return (
    <>
      <TaxonomyTree
        items={itemsWithPopularOnes}
        expandedIds={expandedIds}
        onExpandedChange={newIds => setExpandedIds(newIds)}
        highlightedIds={highlightedIds}
        onHighlightedChange={newIds => setHighlightedIds(newIds)}
      />
    </>
  )
}
