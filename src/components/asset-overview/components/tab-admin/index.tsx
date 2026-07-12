import React, { Suspense, useContext } from 'react'
import { makeStyles } from '@mui/styles'

import { Asset, FullAsset_Editor } from '@/modules/assets'
import { AssetSimilarity } from '@/modules/aisimilar'

import Heading from '@/components/heading'
import AssetTimeline from '@/components/asset-timeline'
import ErrorBoundary from '@/components/error-boundary'
import AiSuggestResult from '@/components/ai-suggest-result'
import AiSimilarResult from '@/components/ai-similar-result'
import AiArea from '@/components/ai-area'
import Columns from '@/components/columns'
import Column from '@/components/column'
import NoResultsMessage from '@/components/no-results-message'
import Button from '@/components/button'
import AssetResultsItem from '@/components/asset-results-item'

import TabContext from '../../context'
import {
  ConfidenceScore,
  getScoreAsPercentage,
  Score,
} from '@/components/ai-result'
import LoadingIndicator from '@/components/loading-indicator'
import EditorControls from '../editor-controls'

const useStyles = makeStyles({
  assets: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  asset: {
    margin: '0 0.5rem 0.5rem 0',
  },
})

const AssetSims = ({
  sims,
  assets,
}: {
  sims: AssetSimilarity[]
  assets: Asset[]
}) => {
  const classes = useStyles()
  return (
    <div className={classes.assets}>
      {sims.map((sim) => (
        <AssetResultsItem
          asset={assets.find((asset) => asset.id === sim.id)}
          controls={
            <ConfidenceScore score={sim.confidence} title={sim.reason} small />
          }
          className={classes.asset}
        />
      ))}
    </div>
  )
}

export default () => {
  const { assetId, asset, hydrate } = useContext(TabContext)

  if (!asset || !('aisimilarities' in asset)) return null

  return (
    <>
      <Suspense fallback={<LoadingIndicator message="Loading controls..." />}>
        <EditorControls />
      </Suspense>
      <Heading variant="h3">AI Stuff</Heading>
      <Columns>
        <Column padding>
          <ErrorBoundary>
            <Heading variant="h4">AI Suggestions</Heading>
            <AiArea
              title="Suggestions"
              tooltip="The site has asked AI to suggest fields for the asset.">
              <AiSuggestResult assetId={asset.id} />
            </AiArea>
          </ErrorBoundary>
        </Column>
        <Column padding>
          <ErrorBoundary>
            <Heading variant="h4">AI Similar Assets</Heading>
            <AiArea
              title="Similar Assets"
              tooltip="The site has asked AI what assets are similar to this one.">
              <AiSimilarResult asset={asset as FullAsset_Editor} />
            </AiArea>
          </ErrorBoundary>
        </Column>
      </Columns>
      <Heading variant="h3">History</Heading>
      <AssetTimeline assetId={assetId} />
    </>
  )
}
