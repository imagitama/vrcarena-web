import React, { Suspense, useContext } from 'react'
import Table from '@/components/responsive-table'
import { TableBody } from '@/components/responsive-table'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import AssetTimeline from '@/components/asset-timeline'
import ErrorBoundary from '@/components/error-boundary'
import AiSuggestResult from '@/components/ai-suggest-result'
import AiSimilarResult from '@/components/ai-similar-result'
import AiArea from '@/components/ai-area'

import TabContext from '../../context'
import LoadingIndicator from '@/components/loading-indicator'
import {
  AssetStatusChanges,
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import { StatusChange } from '@/modules/common'
import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import Tabs from '@/components/tabs'
import WarningMessage from '@/components/warning-message'
import AssetAuditResult from '@/components/asset-audit-result'
import AiResult from '@/components/ai-result'
import {
  AiEvaluateQueuedItem,
  Intent,
  CollectionNames as AiEvaluationCollectionNames,
} from '@/modules/aievaluation'
import AssetEditorRecordManager from '@/components/asset-editor-record-manager'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import { capitalize } from '@/utils'

const StatusChangeTimeline = ({
  statusChanges,
}: {
  statusChanges: AssetStatusChanges
}) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Col</TableCell>
        <TableCell>Value</TableCell>
        <TableCell>Who</TableCell>
        <TableCell>When</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {Object.entries(statusChanges).map(
        ([colName, change]: [string, StatusChange]) => (
          <TableRow key={colName}>
            <TableCell>{capitalize(colName.replace('status', ''))}</TableCell>
            <TableCell>{change.value}</TableCell>
            <TableCell>
              {change && change.userid ? (
                <UsernameLink
                  id={change.userid}
                  username={change.username!}
                  avatarUrl={change.avatarurl!}
                />
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              {change.createdat ? (
                <FormattedDate date={change.createdat} />
              ) : (
                '-'
              )}
            </TableCell>
          </TableRow>
        )
      )}
    </TableBody>
  </Table>
)

export default () => {
  const { assetId, asset, assetExtra, assetEditorData, hydrate } =
    useContext(TabContext)

  if (!asset || !assetExtra || !assetEditorData) return null

  return (
    <Tabs
      items={[
        {
          name: 'controls',
          label: 'Controls',
          contents: (
            <Suspense
              fallback={<LoadingIndicator message="Loading controls..." />}>
              <AssetEditorRecordManager
                id={assetId}
                asset={asset}
                onDone={hydrate}
                actions={assetEditorData!.actions}
              />
            </Suspense>
          ),
        },
        {
          name: 'history',
          label: 'History',
          contents: <AssetTimeline assetId={assetId} />,
        },
        {
          name: 'ai-eval',
          label: 'AI Eval',
          contents: (
            <ErrorBoundary>
              <AiArea
                title="Evaluation"
                tooltip="The site has asked AI to evaluate the asset to determine if it can be auto-approved.">
                <AiResult<AiEvaluateQueuedItem, Asset>
                  title="AI Evaluation"
                  queueCollectionName={
                    AiEvaluationCollectionNames.AiEvaluateQueue
                  }
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
          ),
        },
        {
          name: 'ai-suggest',
          label: 'AI Suggest',
          contents: (
            <ErrorBoundary>
              <AiArea
                title="Suggestions"
                tooltip="The site has asked AI to suggest fields for the asset.">
                <AiSuggestResult assetId={asset.id} />
              </AiArea>
            </ErrorBoundary>
          ),
        },
        {
          name: 'ai-similar',
          label: 'AI Similar',
          contents: (
            <ErrorBoundary>
              <AiArea
                title="Similar Assets"
                tooltip="The site has asked AI what assets are similar to this one.">
                <AiSimilarResult assetExtra={assetExtra} />
              </AiArea>
            </ErrorBoundary>
          ),
        },
        {
          name: 'audit',
          label: 'Audit',
          contents: (
            <ErrorBoundary>
              <AssetAuditResult asset={asset} />
            </ErrorBoundary>
          ),
        },
        {
          name: 'status-changes',
          label: 'Statuses',
          contents: (
            <>
              <WarningMessage>Experimental 17 aug 2026</WarningMessage>
              <StatusChangeTimeline statusChanges={assetExtra.statuschanges} />
            </>
          ),
        },
      ]}
    />
  )
}
