import React, { useState } from 'react'

import {
  Asset,
  CollectionNames,
  FullAsset,
  FullAsset_Editor,
  ViewNames,
} from '@/modules/assets'
import { getCanAssetBePublished } from '@/utils/assets'
import useExperimentalFeature, {
  FeatureName,
} from '@/hooks/useExperimentalFeature'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import useIsEditor from '@/hooks/useIsEditor'

import GenericEditor from '@/components/generic-editor'
import FormControls from '@/components/form-controls'
import PublishAssetButton from '@/components/publish-asset-button'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import AiArea from '@/components/ai-area'
import AiSuggestForm from '@/components/ai-suggest-form'
import ErrorBoundary from '@/components/error-boundary'
import Columns from '@/components/columns'
import Column from '@/components/column'
import PopulateFromAssetSyncForm from '@/components/populate-from-asset-sync-form'
import Paper from '@/components/paper'
import ExperimentalArea from '../experimental-area'
import { getCanSync } from '@/syncing'

const AssetEditor = ({
  assetId,
  onDone,
  onAttemptSave, // scroll to top of assets
  // amendments
  overrideFields,
  onFieldChanged,
  onFieldsChanged,
}: {
  assetId: string | null // null for amendment editor
  onDone?: () => void
  onAttemptSave?: () => void
  // amendments
  overrideFields?: Asset
  onFieldChanged?: (fieldName: string, fieldValue: any) => void
  onFieldsChanged?: (fields: Partial<Asset>) => void
}) => {
  const [isLoading, lastErrorCode, asset, hydrate] =
    useDataStoreItem<FullAsset>(ViewNames.GetFullAssets, assetId || false)
  const isEditor = useIsEditor()
  const [isAiSuggestionEnabledByUser] = useExperimentalFeature(
    FeatureName.AiSuggestions
  )
  const [reRenderKey, setReRenderKey] = useState(0)

  const onAssetSyncDone = (fields: Partial<Asset>) => {
    if (!onFieldsChanged) return
    onFieldsChanged(fields)
    setReRenderKey((i) => i + 1)
  }

  console.debug(`AssetEditor.render`, { reRenderKey, overrideFields })

  if (assetId && (isLoading || asset === null)) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (asset === false) {
    return <NoResultsMessage>No asset found with that ID</NoResultsMessage>
  }

  return (
    <>
      <Columns>
        {assetId && asset && (
          <Column>
            <FormControls>
              <PublishAssetButton
                assetId={assetId}
                asset={asset}
                enableRedirect={false}
                isDisabled={!getCanAssetBePublished(asset)}
              />
            </FormControls>
          </Column>
        )}
        {overrideFields &&
          onFieldsChanged &&
          getCanSync(overrideFields.sourceurl) && (
            <Column>
              <ExperimentalArea>
                This feature is new and experimental. If it does not work please
                report this in our Discord server to help us make it better.
                <br />
                <Paper>
                  <PopulateFromAssetSyncForm
                    assetFields={overrideFields}
                    onDone={(newFields) => onAssetSyncDone(newFields)}
                  />
                </Paper>
              </ExperimentalArea>
              <br />
            </Column>
          )}
        {assetId &&
          asset &&
          (isEditor === true || isAiSuggestionEnabledByUser) && (
            <Column>
              <AiArea
                title="AI Suggestion"
                tooltip="The site asks AI to suggest missing or better fields for this asset.">
                <ErrorBoundary>
                  <AiSuggestForm
                    assetId={assetId}
                    asset={asset as FullAsset_Editor}
                    onDone={hydrate}
                  />
                </ErrorBoundary>
              </AiArea>
            </Column>
          )}
      </Columns>
      <GenericEditor
        key={reRenderKey} // force re-render after sync
        isAccordion
        startExpanded
        collectionName={CollectionNames.Assets}
        id={assetId}
        onDone={onDone}
        itemTypeSingular="Asset"
        showTopSaveBtn
        scrollDisabled
        onAttemptSave={onAttemptSave}
        // amendments
        overrideFields={overrideFields}
        onFieldChanged={onFieldChanged}
        onFieldsChanged={onFieldsChanged}
      />
    </>
  )
}

export default AssetEditor
