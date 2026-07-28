import React, { useContext } from 'react'

import {
  Asset,
  CollectionNames as AssetsCollectionNames,
  FullAssetEditor,
} from '@/modules/assets'

import AiEvaluationResult from '@/components/ai-evaluation-result'
import ErrorBoundary from '@/components/error-boundary'
import AiArea from '@/components/ai-area'
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
  const { assetId, asset, assetEditorData, isLoading, hydrate } =
    useContext(TabContext)

  if (isLoading || !asset || !assetEditorData) {
    return null
  }

  return (
    <>
      <AssetEditorRecordManager
        id={assetId}
        asset={asset}
        onDone={hydrate}
        actions={assetEditorData.actions}
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
            mostRecentQueuedItem={assetEditorData.aievaluation}
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
