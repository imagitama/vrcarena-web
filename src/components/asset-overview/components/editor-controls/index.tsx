import React, { useContext } from 'react'

import {
  Asset,
  CollectionNames as AssetsCollectionNames,
  FullAsset_Editor,
} from '@/modules/assets'

import EditorRecordManager from '@/components/editor-record-manager'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import ErrorBoundary from '@/components/error-boundary'
import AiArea from '@/components/ai-area'
import EditorBox from '@/components/editor-box'
import AssetAuditResult from '@/components/asset-audit-result'

import TabContext from '../../context'
import {
  Intent,
  CollectionNames as AiEvaluationCollectionNames,
  AiEvaluateQueuedItem,
} from '@/modules/aievaluation'
import AiResult from '@/components/ai-result'
import AssetEditorRecordManager from '@/components/asset-editor-record-manager'
import Heading from '@/components/heading'

export default () => {
  const { assetId, asset, isLoading, hydrate } = useContext(TabContext)

  if (isLoading || !asset) {
    return null
  }

  return (
    <>
      <AssetEditorRecordManager
        id={assetId}
        asset={asset as FullAsset_Editor}
        onDone={hydrate}
        actions={(asset as FullAsset_Editor).actions}
      />
      <Heading variant="h4">AI Evaluation</Heading>
      <ErrorBoundary>
        <AiArea
          title="Evaluation"
          tooltip="The site has asked AI to evaluate the asset to determine if it can be auto-approved.">
          <AiResult<AiEvaluateQueuedItem, Asset>
            title="AI Evaluation"
            queueCollectionName={AiEvaluationCollectionNames.AiEvaluateQueue}
            parentCollectionName={AssetsCollectionNames.Assets}
            parentId={asset.id}
            mostRecentQueuedItem={(asset as FullAsset_Editor).aievaluation}
            renderer={AiEvaluationResult}
            extraFields={{
              intent: Intent.AutoApprove,
            }}
          />
        </AiArea>
      </ErrorBoundary>
      <br />
      <ErrorBoundary>
        <Heading variant="h4">Auditing</Heading>
        <AssetAuditResult asset={asset} />
      </ErrorBoundary>
    </>
  )
}
