import React, { useState } from 'react'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import { Helmet } from 'react-helmet'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import * as routes from '../../routes'
import useQueryParam from '../../hooks/useQueryParam'
import Link from '../../components/link'
import Heading from '../../components/heading'
import Button from '../../components/button'
import TaxonomyTree from '../../components/taxonomy-tree'
import { itemsWithPopularOnes } from '../../taxonomy'

export default () => {
  const rankIdsRaw = useQueryParam('rankIds')
  const primaryRankId = useQueryParam('primaryRankId')
  const rankIdsToPreHighlight = rankIdsRaw ? rankIdsRaw.split(',') : []
  const [expandedIds, setExpandedIds] = useState<string[]>(
    rankIdsToPreHighlight
  )
  const [highlightedIds, setHighlightedIds] = useState<string[]>(
    rankIdsToPreHighlight
  )

  return (
    <>
      <Helmet>
        <title>Taxonomy Ranks | VRCArena</title>
        <meta
          name="description"
          content="Browse the entire tree of taxonomy ranks used to group different assets together."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.ranks}>
          <AccountTreeIcon /> Ranks
        </Link>
      </Heading>
      {primaryRankId ? (
        <Button
          url={routes.viewRankWithVar.replace(':rankId', primaryRankId)}
          icon={<ChevronLeftIcon />}
          switchIconSide>
          Return To Rank
        </Button>
      ) : null}
      <br />
      <br />
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
