import React, { Suspense, useContext } from 'react'
import { FullAsset_Editor } from '@/modules/assets'

import Heading from '@/components/heading'
import AssetTimeline from '@/components/asset-timeline'
import ErrorBoundary from '@/components/error-boundary'
import AiSuggestResult from '@/components/ai-suggest-result'
import AiSimilarResult from '@/components/ai-similar-result'
import AiArea from '@/components/ai-area'
import Columns from '@/components/columns'
import Column from '@/components/column'

import TabContext from '../../context'
import LoadingIndicator from '@/components/loading-indicator'
import EditorControls from '../editor-controls'

export default () => {
  const { assetId, asset } = useContext(TabContext)

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
