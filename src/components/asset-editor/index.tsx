import React from 'react'
import {
  Asset,
  CollectionNames,
  FullAsset,
  FullAsset_Editor,
  ViewNames,
} from '@/modules/assets'
import { getCanAssetBePublished } from '@/utils/assets'

import GenericEditor from '@/components/generic-editor'
import FormControls from '@/components/form-controls'
import PublishAssetButton from '@/components/publish-asset-button'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoResultsMessage from '@/components/no-results-message'
import useIsEditor from '@/hooks/useIsEditor'
import AiArea from '../ai-area'
import AiSuggestForm from '../ai-suggest-form'
import ErrorBoundary from '../error-boundary'
import Columns from '../columns'
import Column from '../column'

const AssetEditor = ({
  assetId,
  onDone,
  onAttemptSave, // scroll to top of assets
  // amendments
  overrideFields,
  onFieldChanged,
}: {
  assetId: string | null // null for amendment editor
  onDone?: () => void
  onAttemptSave?: () => void
  // amendments
  overrideFields?: Asset
  onFieldChanged?: (fieldName: string, fieldValue: any) => void
}) => {
  const [isLoading, lastErrorCode, asset, hydrate] =
    useDataStoreItem<FullAsset>(ViewNames.GetFullAssets, assetId || false)
  const isEditor = useIsEditor()

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
        {isEditor && assetId && asset && (
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
      />
    </>
  )
}

export default AssetEditor
